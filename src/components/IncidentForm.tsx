import React, { useState } from 'react';
import {
  AlertCircle,
  Sparkles,
  Link2,
  User,
  Layers,
  FileText,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { INCIDENT_TYPES, IncidentSubmission } from '../types';

interface IncidentFormProps {
  onSubmit: (data: IncidentSubmission) => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, isAnalyzing, error }) => {
  const [incidentType, setIncidentType] = useState<string>(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState<string>('');
  const [suspiciousUrlOrSource, setSuspiciousUrlOrSource] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const charCount = description.trim().length;
  const isDescriptionValid = charCount >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isDescriptionValid) {
      return;
    }

    await onSubmit({
      incidentType,
      description: description.trim(),
      suspiciousUrlOrSource: suspiciousUrlOrSource.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
    });
  };

  const handleClear = () => {
    setDescription('');
    setSuspiciousUrlOrSource('');
    setReporterName('');
    setIncidentType(INCIDENT_TYPES[0]);
    setTouched(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Olay Bildirim Formu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Şüpheli Güvenlik Olayını Kaydet
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Kurum bünyesinde tespit edilen siber tehdit ve güvenlik anomalilerini detaylandırarak analize gönderin.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-200">Canlı Bildirim Girişi</span>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-300">İşlem Başarısız Oldu</p>
            <p className="text-xs text-red-200/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Olay Türü */}
          <div>
            <label
              htmlFor="incident-type-select"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              1. Olay Türü <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <select
                id="incident-type-select"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full h-11 px-3.5 py-2.5 rounded-xl glass-input text-sm cursor-pointer appearance-none pr-10 focus:ring-1 focus:ring-cyan-500"
                required
              >
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-950 text-slate-200">
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Karşılaşılan güvenlik tehdidinin genel sınıflandırmasını seçiniz.
            </p>
          </div>

          {/* 2. Bildiren Kişi */}
          <div>
            <label
              htmlFor="reporter-name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Bildiren Kişi <span className="text-slate-500 font-normal lowercase">(opsiyonel)</span>
            </label>
            <input
              id="reporter-name-input"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Örn: ahmet.yilmaz@kurum.edu.tr veya Sicil/Ogrenci No"
              className="w-full h-11 px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Anonim bildirim için boş bırakabilirsiniz. İletişim için kurum e-postanızı ekleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* 3. Şüpheli URL veya Kaynak */}
        <div>
          <label
            htmlFor="suspicious-source-input"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            Şüpheli URL, Dosya Adı veya Kaynak <span className="text-slate-500 font-normal lowercase">(opsiyonel)</span>
          </label>
          <input
            id="suspicious-source-input"
            type="text"
            value={suspiciousUrlOrSource}
            onChange={(e) => setSuspiciousUrlOrSource(e.target.value)}
            placeholder="Örn: https://login-universite-portal.online veya 192.168.1.105 veya Dosya_Adi.exe"
            className="w-full h-11 px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Güvenlik notu: Girilen bağlantılar sistem tarafından ziyaret edilmez veya dış ağda taranmaz; yalnızca metin bağlamı olarak analiz edilir.
          </p>
        </div>

        {/* 4. Olay Açıklaması */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="description-textarea"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Olay Açıklaması ve Gözlemlenen Belirtiler <span className="text-cyan-400">*</span>
            </label>
            <span
              className={`text-xs font-mono ${isDescriptionValid ? 'text-teal-400' : touched ? 'text-rose-400' : 'text-slate-500'
                }`}
            >
              {charCount} / min 20 karakter
            </span>
          </div>

          <textarea
            id="description-textarea"
            rows={5}
            value={description}
            placeholder="Şüpheli e-posta içeriği, tıklanan bağlantılar, ekrandaki uyarılar veya sistemde fark ettiğiniz olağan dışı davranışları lütfen detaylıca açıklayınız..."
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`w-full p-3.5 rounded-xl glass-input text-sm placeholder:text-slate-500 resize-y leading-relaxed ${touched && !isDescriptionValid
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
              : 'focus:ring-1 focus:ring-cyan-500'
              }`}
            required
          />

          {touched && !isDescriptionValid && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Olay açıklaması en az 20 karakter olmalıdır (lütfen biraz daha detay veriniz).
            </p>
          )}
          <p className="text-[11px] text-slate-500 mt-1.5">
            Analiz kalitesi sağlanan metnin netliğine bağlıdır. Sisteme parola veya kişisel hassas veri girmeyiniz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Gemini 3.8 Flash güvenlik muhakeme motoru</span>
            </div>

            {(description || suspiciousUrlOrSource || reporterName) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Formdaki girdileri temizle"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Formu Temizle</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-[0.98]'
              }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-cyan-400 rounded-full animate-spin" />
                <span>Tehdit İnceleniyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Tehdidi Analiz Et</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};