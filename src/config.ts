/**
 * CyberShield AI - Güvenlik ve Entegrasyon Yapılandırması
 *
 * Güvenlik Mimarisi:
 * Webhook URL'si, Telegram bot token'ları veya Gemini API anahtarları gibi hassas bilgiler
 * asla istemci koduna (frontend bundle) gömülmez ve istemciden keyfî hedef URL kabul edilmez.
 * Make.com Webhook hedefi sunucu tarafında 'MAKE_WEBHOOK_URL' ortam değişkeninden okunur (SSRF Koruması).
 */

export interface WebhookStatus {
  isConfigured: boolean;
  provider: string;
}

export async function checkServerWebhookStatus(): Promise<WebhookStatus> {
  try {
    const res = await fetch('/api/webhook/status');
    if (!res.ok) {
      return { isConfigured: false, provider: 'Make.com CSIRT Entegrasyonu' };
    }
    return await res.json();
  } catch {
    return { isConfigured: false, provider: 'Make.com CSIRT Entegrasyonu' };
  }
}
