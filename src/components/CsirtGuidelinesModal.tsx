import React from 'react';
import { X, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface CsirtGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsirtGuidelinesModal: React.FC<CsirtGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Kurumsal Olay Müdahale (CSIRT) Protokolü
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

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              1. Güvenli Bildirim İlkeleri
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
              Şüpheli e-posta veya mesajlardaki hiçbir bağlantıya tıklamayınız. Ek dosyaları açmayınız. Sistemimize yapıştırdığınız URL veya dosya adları arka planda asla otomatik çalıştırılmaz veya ziyaret edilmez.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. Tehdit Seviyesi Değerlendirme Kriterleri
            </h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400 shrink-0">Kritik:</span>
                <span>Parola/kullanıcı adı girilmiş, fidye yazılımı çalıştırılmış, yetkisiz veri sızıntısı veya yönetici hesabı ihlali tespit edilen durumlar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">Orta:</span>
                <span>Şüpheli bağlantı içeren ancak henüz tıklanmamış oltalama e-postaları, olağan dışı port taramaları veya tespit edilen anomali işaretleri.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-400 shrink-0">Düşük:</span>
                <span>Standart spam, zararsız bültenler veya doğrudan güvenlik tehdidi oluşturmayan genel sistem aksaklıkları.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              3. Müdahale Ekibine İletim & Entegrasyon
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
              "Olayı Kaydet ve Müdahale Ekibine İlet" butonuna basıldığında analiz sonucu standart JSON formatında hazırlanır ve tarayıcı konsoluna yazdırılır. Sistem bir sonraki aşamada Make.com webhook entegrasyonu ile kurumsal SOC biletleme sistemine (Jira, ServiceNow, SIEM) bağlanacaktır.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-white/10 flex justify-end bg-slate-950/50">
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
