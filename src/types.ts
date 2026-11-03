export type IncidentType =
  | 'Oltalama / Phishing'
  | 'Şüpheli E-posta'
  | 'Zararlı Yazılım'
  | 'Yetkisiz Erişim'
  | 'Ağ Anomalisi'
  | 'Şüpheli Bağlantı / URL'
  | 'Diğer';

export const INCIDENT_TYPES: IncidentType[] = [
  'Oltalama / Phishing',
  'Şüpheli E-posta',
  'Zararlı Yazılım',
  'Yetkisiz Erişim',
  'Ağ Anomalisi',
  'Şüpheli Bağlantı / URL',
  'Diğer',
];

export type RiskLevel = 'Düşük' | 'Orta' | 'Kritik';

export interface IncidentSubmission {
  incidentType: IncidentType | string;
  description: string;
  suspiciousUrlOrSource?: string;
  reporterName?: string;
}

export interface AnalysisResult {
  incidentType: string;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  summary: string;
  indicators: string[];
  recommendedActions: string[];
  reasoningSummary: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  submission: IncidentSubmission;
  analysis: AnalysisResult;
  forwardedToTeam: boolean;
  forwardedAt?: string;
}

export interface QuickTemplate {
  title: string;
  incidentType: IncidentType;
  description: string;
  suspiciousUrlOrSource: string;
  reporterName: string;
  shortTag: string;
}
