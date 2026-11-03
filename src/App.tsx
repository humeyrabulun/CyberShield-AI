import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IncidentForm } from './components/IncidentForm';
import { AnalysisCard } from './components/AnalysisCard';
import { IncidentHistoryModal } from './components/IncidentHistoryModal';
import { CsirtGuidelinesModal } from './components/CsirtGuidelinesModal';
import { WebhookConfigModal } from './components/WebhookConfigModal';
import { DownloadZipModal } from './components/DownloadZipModal';
import { Footer } from './components/Footer';
import { AnalysisResult, IncidentRecord, IncidentSubmission } from './types';
import { generateIncidentId } from './utils/validation';
import { Shield, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'cybershield_incidents_v1';

export default function App() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<IncidentRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);
  const [isWebhookConfigOpen, setIsWebhookConfigOpen] = useState<boolean>(false);
  const [isDownloadZipOpen, setIsDownloadZipOpen] = useState<boolean>(false);

  // Load stored incidents on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIncidents(parsed);
          if (parsed.length > 0 && !currentRecord) {
            setCurrentRecord(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save incidents to localStorage
  const saveIncidents = (updated: IncidentRecord[]) => {
    setIncidents(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Submit incident for Gemini analysis
  const handleAnalyze = async (submission: IncidentSubmission) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Analiz sunucusundan yanıt alınamadı.');
      }

      const analysisResult: AnalysisResult = await response.json();

      const newRecord: IncidentRecord = {
        id: generateIncidentId(),
        timestamp: new Date().toISOString(),
        submission,
        analysis: analysisResult,
        forwardedToTeam: false,
      };

      const updatedList = [newRecord, ...incidents];
      saveIncidents(updatedList);
      setCurrentRecord(newRecord);

      // Scroll smoothly to results card
      setTimeout(() => {
        const resultEl = document.getElementById('analysis-result-view');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      console.error('Analiz hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mark incident as forwarded to CSIRT team
  const handleForwardToTeam = (recordId: string) => {
    const updated = incidents.map((item) => {
      if (item.id === recordId) {
        return {
          ...item,
          forwardedToTeam: true,
          forwardedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveIncidents(updated);
    if (currentRecord && currentRecord.id === recordId) {
      setCurrentRecord({
        ...currentRecord,
        forwardedToTeam: true,
        forwardedAt: new Date().toISOString(),
      });
    }
  };

  const handleClearRecords = () => {
    setIncidents([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Quick stats summary
  const totalReports = incidents.length;
  const criticalReports = incidents.filter((i) => i.analysis.riskLevel === 'Kritik').length;
  const forwardedReports = incidents.filter((i) => i.forwardedToTeam).length;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[600px] -left-40 w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-teal-950/20 rounded-full blur-[140px]" />
      </div>

      {/* Top Bar Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenWebhookConfig={() => setIsWebhookConfigOpen(true)}
        onOpenDownloadZip={() => setIsDownloadZipOpen(true)}
        incidentCount={incidents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini 3.8 Flash Destekli Triyaj ve Triage Analizi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" style={{ textWrap: 'balance' }}>
            CyberShield AI
          </h1>
          <p className="text-lg sm:text-xl text-cyan-200/90 font-medium mt-2">
            Akıllı Siber Güvenlik Olay Müdahale Sistemi
          </p>
          <p className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            Kurum veya üniversite kullanıcılarının karşılaştığı oltalama, şüpheli e-posta veya yetkisiz erişim olaylarını saniyeler içinde analiz edin, IoC göstergelerini tespit edin ve CSIRT müdahale ekibine iletin.
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
            <div className="glass-panel-subtle p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Toplam Analiz</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {totalReports}
              </span>
            </div>
            <div className="glass-panel-subtle p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Kritik Olay</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-rose-400 tabular-nums">
                {criticalReports}
              </span>
            </div>
            <div className="glass-panel-subtle p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Ekibe İletilen</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-teal-400 tabular-nums">
                {forwardedReports}
              </span>
            </div>
          </div>
        </div>

        {/* Form and Result Grid */}
        <div className="space-y-10" id="report-section">
          {/* Incident Report Form */}
          <IncidentForm
            onSubmit={handleAnalyze}
            isAnalyzing={isAnalyzing}
            error={error}
          />

          {/* Incident Analysis Result Section */}
          {currentRecord && (
            <div id="analysis-result-view" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Analiz ve Triyaj Sonucu
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    [{currentRecord.id}]
                  </span>
                </div>

                <span className="text-xs text-slate-400">
                  Bildirim Zamanı:{' '}
                  <span className="font-mono text-slate-300">
                    {new Date(currentRecord.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </span>
              </div>

              <AnalysisCard
                analysis={currentRecord.analysis}
                record={currentRecord}
                onForwardToTeam={handleForwardToTeam}
                onOpenWebhookConfig={() => setIsWebhookConfigOpen(true)}
              />
            </div>
          )}

          {/* Quick CSIRT Protocol Banner */}
          <div className="glass-panel-subtle rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Kurumsal Olay Müdahale İlkeleri & Make.com Entegrasyonu
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Şüpheli durum tespit ettiğinizde bağlantıları tıklamayınız. Analiz sonuçları Make.com Webhook standardında JSON yükü olarak yapılandırılmıştır ve tarayıcı konsoluna yazdırılmaktadır.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Protokolü İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenDownloadZip={() => setIsDownloadZipOpen(true)}
      />

      {/* Modals */}
      <IncidentHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={incidents}
        onSelectRecord={(rec) => setCurrentRecord(rec)}
        onClearRecords={handleClearRecords}
      />

      <CsirtGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <WebhookConfigModal
        isOpen={isWebhookConfigOpen}
        onClose={() => setIsWebhookConfigOpen(false)}
      />

      <DownloadZipModal
        isOpen={isDownloadZipOpen}
        onClose={() => setIsDownloadZipOpen(false)}
      />
    </div>
  );
}
