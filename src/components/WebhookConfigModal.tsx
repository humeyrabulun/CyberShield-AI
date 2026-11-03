import React, { useEffect, useState } from 'react';
import { X, Globe, ShieldCheck, CheckCircle2, AlertTriangle, FileSpreadsheet, Send, Lock } from 'lucide-react';
import { checkServerWebhookStatus, WebhookStatus } from '../config';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<WebhookStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      checkServerWebhookStatus()
        .then((res) => {
          setStatus(res);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Make.com & CSIRT Entegrasyon Durumu
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-300">
          {/* Security Architecture Callout */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-cyan-300 uppercase tracking-wider block">
                Güvenli Sunucu Tarafı İletim (SSRF Korumalı)
              </span>
              <p className="text-cyan-100/90 leading-relaxed">
                Webhook adresi, istemci (tarayıcı) kaynak koduna dahil edilmez ve kullanıcıdan keyfî hedef URL kabul edilmez.
                İletimler doğrudan sunucu tarafında korunan <code className="font-mono text-cyan-300 bg-cyan-950/80 px-1 py-0.5 rounded">MAKE_WEBHOOK_URL</code> ortam değişkeni üzerinden gerçekleştirilir.
              </p>
            </div>
          </div>

          {/* Current Connection Status */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sunucu Bağlantı Durumu
              </span>
              {isLoading ? (
                <span className="text-xs text-slate-500">Kontrol ediliyor...</span>
              ) : status?.isConfigured ? (
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aktif ve Hazır
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Ortam Değişkeni Bekleniyor
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {status?.isConfigured
                ? 'Sunucu ortamında geçerli bir MAKE_WEBHOOK_URL tanımlanmıştır. Butona tıklandığında olaylar doğrudan bu hedefe iletilecektir.'
                : 'Sunucudaki MAKE_WEBHOOK_URL değişkeni henüz varsayılan placeholder durumundadır. Gerçek iletim için sunucunun .env dosyasına Make.com webhook URL\'nizi ekleyin.'}
            </p>
          </div>

          {/* Integration Destinations Pipeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              Make.com Otomasyon Dağıtım Hattı
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Google Sheets Kaydı</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Olay ID, risk seviyesi, analiz özeti ve IoC göstergeleri kurumsal denetim tablosuna otomatik işlenir.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
                <Send className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Telegram CSIRT Bildirimi</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Kritik veya orta seviye tehditler anında CSIRT nöbetçi ekibinin Telegram kanalına bildirim olarak düşer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="text-xs text-slate-400 space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
            <span className="font-semibold text-slate-300 block">Kurulum Talimatı:</span>
            <p>1. Sunucudaki <code className="text-cyan-300 font-mono">.env</code> dosyasına Make Webhook URL'nizi tanımlayın:</p>
            <pre className="font-mono text-cyan-200 bg-slate-950 p-2 rounded-lg text-[11px] overflow-x-auto">
              MAKE_WEBHOOK_URL="https://hook.euX.make.com/your-webhook-id-here"
            </pre>
            <p>2. Uygulama sunucusunu yeniden başlatın. GitHub'a yüklerken <code className="text-cyan-300 font-mono">.env</code> dosyasının <code className="text-cyan-300 font-mono">.gitignore</code> ile hariç tutulduğunu doğrulayın.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>CyberShield Security Constitution</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold cursor-pointer transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
