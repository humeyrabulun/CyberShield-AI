import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Send,
  Copy,
  Check,
  FileCode,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { AnalysisResult, IncidentRecord } from '../types';
import { prepareMakeWebhookPayload } from '../utils/validation';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  record: IncidentRecord;
  onForwardToTeam: (recordId: string) => void;
  onOpenWebhookConfig?: () => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  record,
  onForwardToTeam,
  onOpenWebhookConfig,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showJson, setShowJson] = useState<boolean>(false);

  // Webhook submission states
  const [isForwarding, setIsForwarding] = useState<boolean>(false);
  const [forwardStatus, setForwardStatus] = useState<'idle' | 'success' | 'error'>(
    record.forwardedToTeam ? 'success' : 'idle'
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(
    record.forwardedToTeam
      ? 'Olay başarıyla kaydedildi ve müdahale sistemine iletildi.'
      : null
  );

  // Risk styling and metadata
  const getRiskMeta = (level: string) => {
    switch (level) {
      case 'Kritik':
        return {
          label: 'KRİTİK TEHDİT',
          badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950',
          accentBorder: 'border-rose-500/30',
          icon: <Flame className="w-5 h-5 text-rose-400" />,
          barColor: 'bg-rose-500',
        };
      case 'Düşük':
        return {
          label: 'DÜŞÜK RİSK',
          badgeClass: 'bg-teal-950/80 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-950',
          accentBorder: 'border-teal-500/30',
          icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
          barColor: 'bg-teal-500',
        };
      case 'Orta':
      default:
        return {
          label: 'ORTA RİSK',
          badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950',
          accentBorder: 'border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          barColor: 'bg-amber-500',
        };
    }
  };

    const riskMeta = getRiskMeta(analysis.riskLevel);
  const makeWebhookPayload = prepareMakeWebhookPayload(record);

  const handleForwardClick = async () => {
    // Prevent duplicate rapid clicks
    if (isForwarding) return;

    setIsForwarding(true);
    setStatusMessage(null);

    // Print payload to console for developer and audit inspection
    console.log('[CyberShield AI] Make.com CSIRT Webhook İletimi Başlatıldı:', makeWebhookPayload);

    try {
      // Send HTTP POST request with Content-Type: application/json
      // Target is strictly controlled by the server environment variable MAKE_WEBHOOK_URL
      const response = await fetch('/api/webhook/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: makeWebhookPayload,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setForwardStatus('success');
        setStatusMessage('Olay başarıyla kaydedildi ve müdahale sistemine iletildi.');
        onForwardToTeam(record.id);
      } else {
        console.error('[CyberShield AI] Webhook iletimi başarısız oldu:', data.error || response.statusText);
        setForwardStatus('error');
        setStatusMessage('Olay iletilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err: unknown) {
      console.error('[CyberShield AI] Webhook bağlantı hatası:', err);
      setForwardStatus('error');
      setStatusMessage('Olay iletilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(makeWebhookPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-panel-glow rounded-2xl p-6 sm:p-8 border ${riskMeta.accentBorder} relative transition-all`}>
      {/* Top Banner: Incident Category & Threat Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center">
            {riskMeta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Olay Analiz Raporu
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-xs text-cyan-400 font-medium">{analysis.incidentType}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 tracking-tight">
              Güvenlik Tehdit Değerlendirmesi
            </h3>
          </div>
        </div>

        {/* Dual: Explicit Text Label + Distinct Visual Tag */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 ${riskMeta.badgeClass}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{riskMeta.label}</span>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Güven Skoru:</span>
            <span className="text-xs font-bold font-mono text-cyan-300 tabular-nums">
              %{analysis.confidence}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Model Değerlendirme Güveni</span>
          </span>
          <span className="font-mono text-cyan-300 tabular-nums">%{analysis.confidence} / %100</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-700 ${riskMeta.barColor}`}
            style={{ width: `${Math.min(100, Math.max(5, analysis.confidence))}%` }}
          />
        </div>
      </div>

      {/* 1. Olay Özeti */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Olay Özeti
        </h4>
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-slate-200 text-sm leading-relaxed">
          {analysis.summary}
        </div>
      </div>

      {/* 2 Grid: Tespit Edilen Göstergeler & Önerilen Müdahale Adımları */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tespit Edilen Göstergeler */}
        <div className="flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Tespit Edilen Göstergeler (IoC / Anomali)</span>
          </h4>
          <div className="flex-1 p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2.5">
            {analysis.indicators.length > 0 ? (
              analysis.indicators.map((indicator, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-1.5 shrink-0" />
                  <span>{indicator}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Spesifik gösterge listelenmedi.</p>
            )}
          </div>
        </div>

        {/* Önerilen Müdahale Adımları */}
        <div className="flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Önerilen Müdahale Adımları (Playbook)</span>
          </h4>
          <div className="flex-1 p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2.5">
            {analysis.recommendedActions.length > 0 ? (
              analysis.recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-teal-950 border border-teal-500/30 text-teal-400 flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Müdahale adımı oluşturulmadı.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Neden & Belirsizlik Açıklaması (reasoningSummary) */}
      <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Analiz Gerekçesi ve Belirsizlik Beyanı</span>
        </div>
        <p className="text-xs text-cyan-100/90 leading-relaxed">
          {analysis.reasoningSummary}
        </p>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            forwardStatus === 'success'
              ? 'bg-teal-950/60 border-teal-500/40 text-teal-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          {forwardStatus === 'success' ? (
            <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider">
              {forwardStatus === 'success' ? 'İşlem Başarılı' : 'İletim Başarısız'}
            </p>
            <p className="text-xs mt-0.5 font-medium">{statusMessage}</p>
            {forwardStatus === 'error' && (
              <p className="text-[11px] text-rose-300/80 mt-1">
                Sunucu tarafında <code className="font-mono">MAKE_WEBHOOK_URL</code> ortam değişkeni henüz tanımlanmamış veya geçersiz olabilir.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle JSON preview & Webhook configuration */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON Yükü</span>
            {showJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {onOpenWebhookConfig && (
            <button
              type="button"
              onClick={onOpenWebhookConfig}
              className="text-xs text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Make.com CSIRT Entegrasyon Rehberi"
            >
              <Globe className="w-3 h-3" />
              <span className="font-mono text-[11px]">Make.com Entegrasyonu</span>
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="JSON kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'JSON Kopyala'}</span>
          </button>

          <button
            type="button"
            disabled={isForwarding}
            onClick={handleForwardClick}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
              isForwarding
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10'
                : forwardStatus === 'success'
                ? 'bg-teal-600 hover:bg-teal-500 text-white border border-teal-400/40 shadow-teal-900/40 cursor-pointer'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 active:scale-[0.98] cursor-pointer'
            }`}
          >
            {isForwarding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>İletiliyor...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Olayı Kaydet ve Müdahale Ekibine İlet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Viewer Drawer */}
      {showJson && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-[11px] font-mono text-cyan-400">Make.com Webhook Dispatch Payload (JSON)</span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {copied ? 'Panoya Alındı' : 'Kopyala'}
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 leading-relaxed tabular-nums">
            {JSON.stringify(makeWebhookPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
