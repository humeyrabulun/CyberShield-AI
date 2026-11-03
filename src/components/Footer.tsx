import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  onOpenGuidelines: () => void;
  onOpenDownloadZip?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuidelines, onOpenDownloadZip }) => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">CyberShield AI</span>
          <span>— Akıllı Siber Güvenlik Olay Müdahale Sistemi</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <button
            type="button"
            onClick={onOpenGuidelines}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Müdahale Protokolü
          </button>
          <span>·</span>
          {onOpenDownloadZip ? (
            <button
              type="button"
              onClick={onOpenDownloadZip}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Kaynak Kod (.ZIP)
            </button>
          ) : (
            <a
              href="/download-zip"
              download="cybershield-ai.zip"
              className="hover:text-cyan-300 transition-colors"
            >
              Kaynak Kod (.ZIP)
            </a>
          )}
          <span>·</span>
          <span>Make.com Uyumlu</span>
          <span>·</span>
          <span>Sürüm 1.0</span>
        </div>
      </div>
    </footer>
  );
};
