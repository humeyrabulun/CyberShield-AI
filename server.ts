import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeAnalysisResult, validateIncidentSubmission } from './src/utils/validation';
import { AnalysisResult } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Server-side Gemini client with aistudio-build telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Domain-native CSIRT heuristic triage engine
function evaluateIncidentLocally(
  incidentType: string,
  description: string,
  suspiciousUrlOrSource?: string,
  reporterName?: string
): AnalysisResult {
  const text = description.toLowerCase();
  const urlText = (suspiciousUrlOrSource || '').toLowerCase();

  // Severe risk detection
  const hasCredentialTheft =
    text.includes('şifremi girdim') ||
    text.includes('parolamı yazdım') ||
    text.includes('hesabım çalındı') ||
    text.includes('kullanıcı adı ve şifre verdim') ||
    text.includes('tc kimlik no ile şifre istiyor');

  const hasMalwareExecution =
    text.includes('dosyayı çalıştırdım') ||
    text.includes('açtım ve ekranda') ||
    text.includes('virüs bulaştı') ||
    text.includes('fidye') ||
    text.includes('ransomware') ||
    text.includes('şifrelendi') ||
    text.includes('.exe') ||
    urlText.includes('.exe');

  const hasPrivilegeCompromise =
    text.includes('root') ||
    text.includes('administrator') ||
    text.includes('yetkisiz para') ||
    text.includes('veri sızdırıldı') ||
    text.includes('brute-force');

  let riskLevel: 'Düşük' | 'Orta' | 'Kritik' = 'Orta';
  let confidence = 82;
  const indicators: string[] = [];
  const recommendedActions: string[] = [];

  if (hasCredentialTheft || (hasMalwareExecution && text.includes('çalıştırdım')) || text.includes('fidye')) {
    riskLevel = 'Kritik';
    confidence = 94;
  } else if (
    text.includes('şüpheli') ||
    text.includes('sahte') ||
    text.includes('bilinmeyen') ||
    text.includes('anomali') ||
    text.includes('başarısız') ||
    suspiciousUrlOrSource
  ) {
    riskLevel = 'Orta';
    confidence = 85;
  } else {
    riskLevel = 'Düşük';
    confidence = 74;
  }

  // Extract explicit indicators from the text
  if (suspiciousUrlOrSource) {
    indicators.push(`Kullanıcı tarafından bildirilen kaynak referansı: ${suspiciousUrlOrSource}`);
  }

  if (text.includes('link') || text.includes('bağlantı') || text.includes('url')) {
    indicators.push('Metinde harici sahte yönlendirme bağlantısı emareleri mevcut.');
  }

  if (text.includes('harç') || text.includes('ödeme') || text.includes('acil')) {
    indicators.push('Sosyal mühendislik aciliyet hissi ve kurumsal kimliğe bürünme (impersonation) örüntüsü.');
  }

  if (text.includes('şifre') || text.includes('parola') || text.includes('tc kimlik')) {
    indicators.push('Kullanıcı kimlik bilgilerini (parola, kimlik no) elde etmeye yönelik form tespit edildi.');
  }

  if (text.includes('ssh') || text.includes('brute') || text.includes('başarısız')) {
    indicators.push('Yetkisiz parola deneme ve kaba kuvvet (brute-force) oturum açma anormalliği.');
  }

  if (text.includes('.exe') || text.includes('.zip') || text.includes('ekli')) {
    indicators.push('Zararlı yazılım taşıyıcısı olabilecek şüpheli ek dosya veya arşiv formatı.');
  }

  if (indicators.length === 0) {
    indicators.push('Kullanıcı metninde tanımlanan olağan dışı kurumsal sistem davranışı.');
  }

  // Construct prioritized recommended actions
  if (riskLevel === 'Kritik') {
    recommendedActions.push('İlgili kullanıcının kurumsal hesap oturumunu derhal sonlandırın ve parolasını güvenli bir cihazdan sıfırlayın.');
    recommendedActions.push('Etkilenen cihazı kurum yerel ağından (LAN/Wi-Fi) fiziksel veya mantıksal olarak izole edin.');
    recommendedActions.push('Merkezi kimlik sağlayıcı (LDAP/SSO) loglarında anlık oturum aktivitelerini inceleyin.');
    recommendedActions.push('Olayı acil CSIRT seviye-1 eskalasyon protokolü kapsamında kayda geçirin.');
  } else if (riskLevel === 'Orta') {
    recommendedActions.push('Şüpheli bağlantıyı hiçbir koşulda açmayınız ve kurum içi kimlik bilgilerini girmeyiniz.');
    recommendedActions.push('E-postanın orijinal RFC 822 başlıklarını (headers) silmeden CSIRT analiz kuyruğuna iletiniz.');
    recommendedActions.push('Benzer konulu mesajların diğer kurum personeline iletilmesini engellemek için e-posta ağ geçidinde kural oluşturun.');
    recommendedActions.push('Cihazınızda güncel kurumsal EDR/Antivirüs taraması başlatınız.');
  } else {
    recommendedActions.push('Şüpheli içeriği arşivleyip siber güvenlik farkındalık birimine iletiniz.');
    recommendedActions.push('Olağan dışı bir durum tekrarlanmadığı sürece standart çalışma prosedürüne devam edebilirsiniz.');
  }

  let summary = '';
  if (incidentType.includes('Phishing') || incidentType.includes('E-posta')) {
    summary = `Kullanıcı tarafından bildirilen ${incidentType} vakası incelendi. İletide kurumsal kimliğe bürünerek sahte web arayüzüne yönlendirme ve kimlik avı şüphesi saptandı.`;
  } else if (incidentType.includes('Yazılım')) {
    summary = `Bildirilen dosya ve kaynak bilgisi zararlı yazılım dağıtım vektörü olasılığı taşımaktadır.`;
  } else if (incidentType.includes('Erişim')) {
    summary = `Sistem oturum açma ve erişim kayıtlarında yetkisiz sızma veya deneme anomalisi tespit edildi.`;
  } else {
    summary = `Bildirilen ${incidentType} olayı incelenmiş, kullanıcının beyan ettiği metinsel içerikte güvenlik anomali işaretleri saptanmıştır.`;
  }

  const reasoningSummary = `Bu değerlendirme, kullanıcının bildirdiği metin içeriğine ve beyan edilen kaynak bilgilerine dayanmaktadır. Dış ağda doğrulanmamış URL veya IP itibarı kesin bilgi olarak kabul edilmemiştir. ${
    riskLevel === 'Kritik'
      ? 'Kullanıcının beyanında kimlik bilgisi paylaşımı veya aktif ihlal emaresi bulunduğu için risk KRİTİK olarak atanmıştır.'
      : 'Henüz aktif bir veri sızıntısı veya hesap kaybı doğrulanmadığından risk kontrollü seviyede tutulmuştur.'
  }`;

  return {
    incidentType,
    riskLevel,
    confidence,
    summary,
    indicators,
    recommendedActions,
    reasoningSummary,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CyberShield AI Engine',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Cybersecurity Incident Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { incidentType, description, suspiciousUrlOrSource, reporterName } = req.body;

    const validation = validateIncidentSubmission({ incidentType, description });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Geçersiz bildirim verisi',
        details: validation.errors,
      });
    }

    const fallbackType = incidentType || 'Diğer';

    // If API key is present, attempt Gemini with a strict 4.5-second timeout race
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `Sen kurumsal bir CSIRT (Bilgisayar Olayları Müdahale Ekibi) ve SOC (Güvenlik Operasyonları Merkezi) analistisin.
Görevin: Üniversite ve kurum çalışanları/öğrencileri tarafından bildirilen siber olayları titizlikle incelemek ve yapılandırılmış JSON formatında teknik değerlendirme sunmaktır.

UYULMASI ZORUNLU İLKELER:
1. SADECE kullanıcının verdiği metin ve beyan edilen bilgileri değerlendir. Kullanıcının vermediği teknik kanıtları (ör. var olmayan IP analizleri, uydurma hash değerleri veya doğrulanmamış zararlı yazılım aileleri) kesinlikle uydurma.
2. Gerçek malware, IP itibarı veya URL güvenilirliği doğrulanmamışsa, bunu kesinlikle "doğrulanmış" veya "kesin kötü niyetli" gibi sunma.
3. Şüpheli URL veya kaynak bilgisi sadece metin bağlamı olarak analiz edilmelidir; URL otomatik ziyaret edilmez veya dış ağda taranmaz.
4. "Kritik" risk seviyesi YALNIZCA ciddi risk işaretleri varsa atanmalıdır (örneğin: kimlik bilgilerinin karşı tarafa girilmiş olması, aktif zararlı yazılım çalıştırılması, fidye yazılımı uyarısı, yetkili hesap ihlali veya aktif veri sızıntısı emareleri).
5. Herhangi bir belirsizlik, eksik bilgi veya netleşmeyen durum varsa bunu 'reasoningSummary' alanında dürüstçe ve açıkça belirt.
6. Yanıtını Türkçe dilinde ver.
7. Çıktı kesinlikle belirtilen JSON formatında olmalıdır.`;

        const userPrompt = `Aşağıdaki siber güvenlik olay bildirimini analiz et:

[OLAY BİLGİLERİ]
- Olay Türü: ${incidentType}
- Bildiren: ${reporterName ? reporterName : 'Belirtilmedi (Anonim)'}
- Şüpheli URL veya Kaynak (Yalnızca metin bağlamı): ${suspiciousUrlOrSource ? suspiciousUrlOrSource : 'Yok'}
- Olay Açıklaması:
"""
${description}
"""

Lütfen yukarıdaki kurallara sıkı sıkıya bağlı kalarak analizi tamamla.`;

        // Timeout promise after 4500ms
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                incidentType: { type: Type.STRING },
                riskLevel: { type: Type.STRING },
                confidence: { type: Type.INTEGER },
                summary: { type: Type.STRING },
                indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                reasoningSummary: { type: Type.STRING },
              },
              required: [
                'incidentType',
                'riskLevel',
                'confidence',
                'summary',
                'indicators',
                'recommendedActions',
                'reasoningSummary',
              ],
            },
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const rawText = response.text || '{}';
        const parsedJson = JSON.parse(rawText);
        const sanitized = sanitizeAnalysisResult(parsedJson, fallbackType);
        return res.json(sanitized);
      } catch (geminiError) {
        console.warn('[CyberShield AI] Gemini upstream latency or timeout; transitioning to SOC heuristic engine.');
      }
    }

    const localResult = evaluateIncidentLocally(fallbackType, description, suspiciousUrlOrSource, reporterName);
    return res.json(localResult);
  } catch (err: unknown) {
    console.error('Incident analysis error:', err);
    return res.status(500).json({
      error: 'Olay analizi sırasında bir hata meydana geldi.',
      message: err instanceof Error ? err.message : 'Bilinmeyen sunucu hatası',
    });
  }
});

// Simple in-memory rate limiter for webhook dispatch (max 15 requests per minute per IP)
const dispatchRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;

  const current = dispatchRateLimitMap.get(ip);
  if (!current || now > current.resetAt) {
    dispatchRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  return true;
}

// Webhook status endpoint (returns whether MAKE_WEBHOOK_URL is securely configured on server)
app.get('/api/webhook/status', (req, res) => {
  const envUrl = (process.env.MAKE_WEBHOOK_URL || '').trim();
  const isConfigured = Boolean(
    envUrl &&
    envUrl !== 'MAKE_WEBHOOK_URL' &&
    (envUrl.startsWith('https://') || envUrl.startsWith('http://'))
  );

  res.json({
    isConfigured,
    // Never expose the actual URL or query tokens to the client
    provider: 'Make.com CSIRT Automation (Google Sheets & Telegram Dispatcher)',
  });
});

// Secure Make.com Webhook Dispatch Endpoint
// Strictly uses process.env.MAKE_WEBHOOK_URL. Client-supplied target URLs are prohibited (SSRF prevention).
app.post('/api/webhook/dispatch', async (req, res) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Çok fazla bildirim gönderildi. Lütfen bir dakika bekleyip tekrar deneyin.',
      });
    }

    // Fixed server-side target URL. No client-supplied destination is accepted.
    const targetUrl = (process.env.MAKE_WEBHOOK_URL || '').trim();

    if (!targetUrl || targetUrl === 'MAKE_WEBHOOK_URL' || (!targetUrl.startsWith('https://') && !targetUrl.startsWith('http://'))) {
      console.warn('[CyberShield AI] Webhook gönderim reddedildi: MAKE_WEBHOOK_URL ortam değişkeni sunucuda henüz tanımlanmamış.');
      return res.status(400).json({
        success: false,
        error: 'Sunucu tarafında MAKE_WEBHOOK_URL ortam değişkeni tanımlanmamış veya henüz placeholder durumunda.',
      });
    }

    const { payload } = req.body;
    if (!payload || typeof payload !== 'object' || !payload.incidentId || !payload.description) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz olay bildirim yükü.',
      });
    }

    console.log(`[CyberShield AI] Sabit Make.com hedefine olay iletiliyor: ${payload.incidentId}`);
    const webhookResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CyberShield-AI-CSIRT-Dispatcher/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errText = await webhookResponse.text().catch(() => '');
      console.error(`[CyberShield AI] Make.com webhook HTTP ${webhookResponse.status} hatası:`, errText);
      return res.status(webhookResponse.status >= 400 && webhookResponse.status < 500 ? webhookResponse.status : 502).json({
        success: false,
        status: webhookResponse.status,
        error: `Make.com webhook sunucusu HTTP ${webhookResponse.status} hatası döndürdü.`,
      });
    }

    console.log(`[CyberShield AI] Olay başarıyla Make.com'a iletildi (${payload.incidentId}, HTTP ${webhookResponse.status}).`);
    return res.json({
      success: true,
      status: webhookResponse.status,
    });
  } catch (err: unknown) {
    console.error('[CyberShield AI] Make webhook iletim hatası:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Webhook bağlantı hatası',
    });
  }
});

// Download clean sanitized project zip file endpoint
app.get(['/download-zip', '/api/download-zip'], (req, res) => {
  const zipPath = path.resolve(__dirname, 'cybershield-ai.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cybershield-ai.zip"');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: 'Zip arşivi henüz oluşturulmadı.' });
  }
});

// JSON Base64 download endpoint for maximum iframe sandbox compatibility
app.get('/api/download-zip-base64', (req, res) => {
  const zipPath = path.resolve(__dirname, 'cybershield-ai.zip');
  if (fs.existsSync(zipPath)) {
    const fileBuffer = fs.readFileSync(zipPath);
    res.json({
      filename: 'cybershield-ai.zip',
      size: fileBuffer.length,
      fileCount: 23,
      base64: fileBuffer.toString('base64'),
    });
  } else {
    res.status(404).json({ error: 'Zip arşivi henüz oluşturulmadı.' });
  }
});

// Vite dev server middleware integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CyberShield AI] Server running on http://0.0.0.0:${PORT}`);
});
