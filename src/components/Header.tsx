import React from 'react';
import { Shield, ShieldAlert, History, BookOpen, Download } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenGuidelines: () => void;
  onOpenWebhookConfig: () => void;
  onOpenDownloadZip: () => void;
  incidentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenGuidelines,
  onOpenWebhookConfig,
  onOpenDownloadZip,
  incidentCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              CyberShield AI
            </span>
            <span className="text-[11px] text-cyan-300/80 hidden sm:inline whitespace-nowrap">
              Akıllı Siber Güvenlik Olay Müdahale Sistemi
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#report-section"
            className="text-cyan-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Olay Bildir
          </a>
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Kayıtlar ({incidentCount})</span>
          </button>
          <button
            type="button"
            onClick={onOpenWebhookConfig}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Webhook Bilgisi</span>
          </button>
          <button
            type="button"
            onClick={onOpenGuidelines}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>CSIRT Protokolü</span>
          </button>
          <button
            type="button"
            onClick={onOpenDownloadZip}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Temizlenmiş kaynak kod zip dosyasını indir"
          >
            <Download className="w-4 h-4" />
            <span>Projeyi İndir (.ZIP)</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="md:hidden p-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Olay Geçmişi"
          >
            <History className="w-4 h-4" />
          </button>

          <a
            href="#report-section"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Yeni Bildirim</span>
          </a>
        </div>
      </div>
    </header>
  );
};
