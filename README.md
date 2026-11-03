# <p align="center">🛡️ CyberShield AI</p>
### <p align="center">Akıllı Siber Güvenlik Olay Müdahale ve Triyaj Sistemi</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini%203.8%20Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Make.com-6D28D9?style=for-the-badge&logo=integromat&logoColor=white" alt="Make.com" />
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets" />
  <img src="https://img.shields.io/badge/Telegram%20Bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  <img src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

**CyberShield AI**; üniversiteler, kamu kurumları ve kurumsal şirketlerde personelin veya öğrencilerin karşılaştığı siber vakaları (**Oltalama / Phishing**, **Zararlı Yazılım**, **Yetkisiz Erişim**, **Şüpheli URL** vb.) toplayan, **Google Gemini 3.8 Flash** yapay zeka modeliyle anında teknik triyaja tabi tutan ve **Make.com** otomasyonu üzerinden **Google Sheets** kütüğüne işleyip **Telegram CSIRT** ekiplerine anlık bildirim ileten kurumsal bir olay müdahale platformudur.

---

## 📌 İçindekiler
- Uçtan Uca Süreç Akışı
- Make.com Otomasyon Senaryosu
- Google Sheets Kurumsal Denetim Kütüğü
- Telegram CSIRT Alarm Formatı
- Gönderilen JSON Veri Yapısı
- Hızlı Kurulum ve Çalıştırma
- Güvenlik ve Gizlilik Mimarisi (Zero Secrets)
- Birim Testleri

---

## 🔄 Uçtan Uca Süreç Akışı

Sistem 4 halkadan oluşan tam otomatik ve güvenli bir hat üzerinde çalışır:

```
[ 1. Kullanıcı / Mağdur ]
           │
           ▼  (Olay Türü, Detaylı Açıklama, Şüpheli Bağlantı/Kaynak)
[ 2. CyberShield AI Frontend ]
           │
           ▼  (POST /api/analyze)
[ 3. Express Sunucu Motoru ] ───► [ Google Gemini 3.8 Flash ]
           │                      (Risk Seviyesi, IoC Göstergeleri, CSIRT Playbook)
           ▼  ("Olayı Kaydet ve Müdahale Ekibine İlet" Butonu)
[ 4. SSRF Korumalı Webhook Proxy ] (/api/webhook/dispatch)
           │
           ▼  (JSON POST İsteği)
[ 5. Make.com Senaryo Dağıtım Hattı ]
           ├───► [ Google Sheets ] (Tüm olayların arşivlendiği kurumsal kütük)
           │
           └───► [ Filtre: ORTA / KRİTİK ] ───► [ Telegram CSIRT Botu ] (Nöbetçi ekibe anlık alarm)
```

---

## ⚙️ Make.com Otomasyon Senaryosu

CyberShield AI platformundan gönderilen yapılandırılmış JSON verileri, Make.com üzerinde tasarlanan 3 aşamalı hat tarafından karşılanır:

<p align="center">
  <img src="assets/make-scenario.png" alt="Make.com Otomasyon Senaryosu Akışı" width="100%" />
</p>

### Modül Görevleri:

| Modül | Tür | Görevi |
| :--- | :--- | :--- |
| **Modül 1 (Kırmızı)** | `Custom Webhook` | CyberShield AI sunucusundan gelen güvenli JSON veri paketini karşılar ve alanları ayrıştırır. |
| **Modül 2 (Yeşil)** | `Google Sheets (Add a Row)` | İstisnasız her olayı kurumsal denetim kütüğüne zaman damgalı yeni bir satır olarak ekler. |
| **Filtre** | `ORTA RİSK / KRİTİK` | Bildirim kirliliğini önlemek için yalnızca `Orta` ve `Kritik` vakaların Telegram'a geçişine izin verir. |
| **Modül 3 (Mavi)** | `Telegram Bot (Send Text)` | Nöbetçi CSIRT/SOC ekibinin Telegram kanalına anlık uyarı ve müdahale adımlarını gönderir. |

---

## 📊 Google Sheets Kurumsal Denetim Kütüğü

Google Sheets, olayların zaman sıralı, değişmez ve yasal standartlara uygun olarak arşivlendiği merkezi kayıt defteridir (`Incident Register`). 

### Önerilen Tablo Sütun Haritası:

| Sütun | Başlık | Make.com Veri Eşleştirmesi | Örnek Veri |
| :---: | :--- | :--- | :--- |
| **A** | **Zaman Damgası** | `1. timestamp` | `2026-11-03T00:50:00.000Z` |
| **B** | **Olay Kimliği** | `1. incidentId` | `CS-20261103-035001` |
| **C** | **Olay Türü** | `1. incidentType` | `Oltalama / Phishing` |
| **D** | **Risk Seviyesi** | `1. riskLevel` | `Kritik` |
| **E** | **Güven Skoru** | `1. confidence` | `%94` |
| **F** | **Olay Özeti** | `1. summary` | `Sahte üniversite oturum sayfasına yönlendirme saptandı.` |
| **G** | **IoC Göstergeleri** | `join(1. indicators; ", ")` | `Sahte login formu, Kurumsal kimliğe bürünme` |
| **H** | **Müdahale Adımları** | `join(1. recommendedActions; " \| ")` | `1. Hesabı dondur, 2. Cihazı ağdan izole et` |
| **I** | **Analiz Gerekçesi** | `1. reasoningSummary` | `Kullanıcı beyanında parola girişi emaresi mevcut.` |
| **J** | **Bildiren Kişi** | `1. reporter` | `ogrenci@kurum.edu.tr` |
| **K** | **Şüpheli Kaynak** | `1. suspiciousSource` | `https://login-universite-portal.online` |
| **L** | **Durum** | `1. status` | `Yeni` |

> [!TIP]
> Google Sheets üzerinde oluşturulacak pivot tablo veya filtreler sayesinde kurum içinde en çok hedef alınan birimler ve saldırı tipleri (Phishing, Ransomware vb.) anlık olarak raporlanabilir.

---

## 📲 Telegram CSIRT Alarm Formatı

Filtreden geçen Orta ve Kritik tehditlerde Telegram grubuna düşen örnek bildirim:

```text
🚨 [CSIRT ACİL OLAY BİLDİRİMİ] 🚨

🆔 Olay No: CS-20261103-035001
⚠️ Risk Seviyesi: KRİTİK (%94 Güven)
📂 Olay Türü: Oltalama / Phishing
👤 Bildiren: ogrenci@kurum.edu.tr
🔗 Şüpheli Kaynak: https://login-universite-portal.online

📝 Olay Özeti:
Kullanıcı tarafından bildirilen sahte oturum açma sayfası incelendi. Kurumsal kimlik avı şüphesi saptandı.

⚡ Önerilen İlk Müdahale Adımları:
1. İlgili kullanıcının kurumsal hesap oturumunu derhal sonlandırın ve parolasını sıfırlayın.
2. Etkilenen cihazı kurum yerel ağından (LAN/Wi-Fi) izole edin.
3. Merkezi LDAP/SSO loglarında anlık oturum aktivitelerini inceleyin.

📊 Kayıt Google Sheets kütüğüne başarıyla işlenmiştir.
```

---

## 📦 Gönderilen JSON Veri Yapısı

Make.com webhook uç noktasına iletilen standart veri paketi:

```json
{
  "timestamp": "2026-11-03T00:50:00.000Z",
  "incidentId": "CS-20261103-035001",
  "incidentType": "Oltalama / Phishing",
  "description": "Öğrenci işleri adına gelen harç ödeme e-postasındaki sahte bağlantıya şifremi girdim.",
  "suspiciousSource": "https://login-universite-portal.online/giris.php",
  "riskLevel": "Kritik",
  "confidence": 94,
  "summary": "Kurumsal kimliğe bürünerek sahte web arayüzüne yönlendirme ve aktif kimlik avı saptandı.",
  "indicators": [
    "Kullanıcı tarafından bildirilen kaynak referansı: https://login-universite-portal.online/giris.php",
    "Kullanıcı kimlik bilgilerini ele geçirmeye yönelik form tespit edildi."
  ],
  "recommendedActions": [
    "İlgili kullanıcının kurumsal hesap oturumunu derhal sonlandırın ve parolasını sıfırlayın.",
    "Etkilenen cihazı kurum yerel ağından fiziksel veya mantıksal olarak izole edin.",
    "Merkezi SSO loglarında anlık oturum aktivitelerini inceleyin."
  ],
  "reasoningSummary": "Kullanıcının beyanında kimlik bilgisi paylaşımı bulunduğu için risk seviyesi KRİTİK olarak atanmıştır.",
  "reporter": "ogrenci@kurum.edu.tr",
  "status": "Yeni"
}
```

---

## 🚀 Hızlı Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
npm install --legacy-peer-deps
```

### 2. Ortam Değişkenlerini Hazırlayın (`.env`)
Örnek şablonu kopyalayın:
- **Windows (PowerShell):**
  ```powershell
  copy .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

`.env` dosyasını açıp gerçek değerlerinizi yazın:
```env
# Google Gemini API Anahtarınız (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Make.com Webhook Adresiniz
MAKE_WEBHOOK_URL="https://hook.euX.make.com/kendi_webhook_adresiniz"

PORT=3000
```

### 3. Uygulamayı Başlatın
```bash
npm run dev
```

Tarayıcınızda açın:
👉 **`http://localhost:3000`** *(veya `http://127.0.0.1:3000`)*

---

## 🔒 Güvenlik ve Gizlilik Mimarisi

- **Zero-Client Secrets:** Gemini API anahtarları, Telegram token'ları veya Webhook URL'leri hiçbir zaman frontend koduna sızdırılmaz.
- **SSRF Korumalı Webhook:** İstemciden rastgele URL kabul edilmez; iletim yalnızca sunucu ortamındaki `MAKE_WEBHOOK_URL` değişkenine yapılır.
- **Güvenli URL Politikası:** Şüpheli URL'ler sistem tarafından asla otomatik ziyaret edilmez veya taranmaz; yalnızca metin bağlamı olarak analiz edilir.
- **Hız Sınırlayıcı (Rate Limiter):** Spam ve DoS girişimlerine karşı IP başına dakikada maksimum 15 istek sınırı bulunur.
- **.gitignore:** `.env` ve gizli anahtar içeren tüm yerel dosyalar Git takibinden kesin olarak hariç tutulmuştur.

---

## 🧪 Birim Testleri

Formatlama, şema doğrulama ve veri hazırlama mantığını test etmek için:

```bash
npx tsx --test src/utils/validation.test.ts
```

---

<p align="center">
  Geliştirici & Mühendislik Odaklı Kurumsal CSIRT Çözümü
</p>
