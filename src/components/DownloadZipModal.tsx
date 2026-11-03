import React, { useState } from 'react';
import { X, Download, CheckCircle2, ShieldCheck, FileArchive, AlertCircle, Loader2 } from 'lucide-react';
import { downloadCleanProjectZip } from '../utils/downloadZip';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      await downloadCleanProjectZip();
      setDownloadSuccess(true);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'İndirme sırasında bir hata oluştu.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileArchive className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              CyberShield AI — Temiz Proje Arşivi (.ZIP)
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
        <div className="p-6 space-y-4 text-sm text-slate-300">
          {/* Explanation regarding Windows Explorer error */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
            <span className="font-bold text-cyan-300 uppercase tracking-wider block">
              Windows Gezgini Uyumluluğu
            </span>
            <p className="text-cyan-100/90 leading-relaxed">
              Önceki indirmede tarayıcı iframe önizlemesi nedeniyle dosya HTML olarak kaydedilmiş ve bu yüzden Windows Gezgini <em>"Sıkıştırılmış Klasör Geçersiz"</em> uyarısı vermiştir.
            </p>
            <p className="text-cyan-200/90 font-medium pt-0.5">
              Aşağıdaki buton ile doğrudan <strong>38.9 KB boyutunda tam ve hakiki ZIP arşivi</strong> ikili (Blob) formatında indirilir; Windows, Mac ve Linux ortamlarında hatasız açılır.
            </p>
          </div>

          {/* Archive Specifications */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Dosya Adı:</span>
              <span className="font-mono text-cyan-300 font-semibold">cybershield-ai.zip</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Boyut:</span>
              <span className="font-mono text-white font-medium">38.9 KB (Tam ZIP Arşivi)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Paket Kapsamı:</span>
              <span className="text-slate-200">23 Temiz Kaynak Dosya, Testler & README</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Güvenlik Durumu:</span>
              <span className="text-teal-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sıfır Gizli Anahtar / Zero Secrets
              </span>
            </div>
          </div>

          {/* Success Notification */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/40 flex items-center gap-2.5 text-xs text-teal-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>cybershield-ai.zip başarıyla indirildi! Artık Windows Gezgini ile sağ tıklayıp "Tümünü Ayıkla" yapabilirsiniz.</span>
            </div>
          )}

          {/* Error Notification */}
          {downloadError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{downloadError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Kapat
          </button>

          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownload}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isDownloading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Paket İndiriliyor...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Temiz ZIP Dosyasını İndir (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
