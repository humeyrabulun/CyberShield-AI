import React from 'react';
import { X, History, Trash2, FileDown, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { IncidentRecord } from '../types';

interface IncidentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IncidentRecord[];
  onSelectRecord: (record: IncidentRecord) => void;
  onClearRecords: () => void;
}

export const IncidentHistoryModal: React.FC<IncidentHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onClearRecords,
}) => {
  if (!isOpen) return null;

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybershield-incident-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Kritik':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/30';
      case 'Düşük':
        return 'bg-teal-950/80 text-teal-300 border-teal-500/30';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Olay Bildirim Geçmişi ({records.length})
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

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">Henüz kayıtlı olay bulunmuyor</p>
              <p className="text-xs text-slate-500 mt-1">
                Form üzerinden bir olay analizi yaptığınızda kayıtlar burada saklanır.
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  onSelectRecord(rec);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/50 hover:bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskBadge(rec.analysis.riskLevel)}`}>
                      {rec.analysis.riskLevel}
                    </span>
                    <span className="text-xs font-semibold text-white truncate">
                      {rec.submission.incidentType}
                    </span>
                    {rec.forwardedToTeam && (
                      <span className="text-[10px] text-teal-400 flex items-center gap-1 font-medium bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        İletildi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {rec.submission.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(rec.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>·</span>
                    <span>Güven: %{rec.analysis.confidence}</span>
                    {rec.submission.reporterName && (
                      <>
                        <span>·</span>
                        <span className="truncate">{rec.submission.reporterName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                  >
                    Detay
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        {records.length > 0 && (
          <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
            <button
              type="button"
              onClick={onClearRecords}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Geçmişi Temizle</span>
            </button>

            <button
              type="button"
              onClick={handleExportAll}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>JSON Dışa Aktar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
