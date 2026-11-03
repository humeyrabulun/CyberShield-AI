import { AnalysisResult, IncidentRecord, IncidentSubmission, RiskLevel } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    description?: string;
    incidentType?: string;
  };
}

export function validateIncidentSubmission(data: Partial<IncidentSubmission>): ValidationResult {
  const errors: { description?: string; incidentType?: string } = {};

  if (!data.incidentType || data.incidentType.trim() === '') {
    errors.incidentType = 'Lütfen bir olay türü seçin.';
  }

  const cleanDescription = (data.description || '').trim();
  if (cleanDescription.length < 20) {
    errors.description = `Olay açıklaması en az 20 karakter olmalıdır (şu an: ${cleanDescription.length} karakter).`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function normalizeRiskLevel(rawLevel: unknown): RiskLevel {
  if (typeof rawLevel !== 'string') return 'Orta';
  const lower = rawLevel.trim().toLowerCase();
  if (lower.includes('kritik') || lower.includes('critical') || lower.includes('yüksek') || lower.includes('high')) {
    return 'Kritik';
  }
  if (lower.includes('düşük') || lower.includes('dusuk') || lower.includes('low')) {
    return 'Düşük';
  }
  return 'Orta';
}

export function clampConfidence(score: unknown): number {
  const num = typeof score === 'number' ? score : parseFloat(String(score));
  if (isNaN(num)) return 70;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function sanitizeAnalysisResult(raw: Partial<AnalysisResult>, fallbackType: string): AnalysisResult {
  return {
    incidentType: typeof raw.incidentType === 'string' && raw.incidentType.trim() ? raw.incidentType.trim() : fallbackType,
    riskLevel: normalizeRiskLevel(raw.riskLevel),
    confidence: clampConfidence(raw.confidence),
    summary: typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary.trim() : 'Olay özeti oluşturulamadı.',
    indicators: Array.isArray(raw.indicators)
      ? raw.indicators.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : ['Belirtilen metin içeriğinde net gösterge tespit edilemedi.'],
    recommendedActions: Array.isArray(raw.recommendedActions)
      ? raw.recommendedActions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : ['Şüpheli içeriği açmayınız ve CSIRT ekibinin incelemesini bekleyiniz.'],
    reasoningSummary: typeof raw.reasoningSummary === 'string' && raw.reasoningSummary.trim()
      ? raw.reasoningSummary.trim()
      : 'Sistem analizi yalnızca kullanıcı tarafından sağlanan metin açıklamasına dayanmaktadır.',
  };
}

export function generateIncidentId(date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `CS-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export interface MakeWebhookPayload {
  timestamp: string;
  incidentId: string;
  incidentType: string;
  description: string;
  suspiciousSource?: string | null;
  riskLevel: RiskLevel;
  confidence: number;
  summary: string;
  indicators: string[];
  recommendedActions: string[];
  reasoningSummary: string;
  reporter?: string | null;
  status: 'Yeni';
}

export function prepareMakeWebhookPayload(record: IncidentRecord): MakeWebhookPayload {
  return {
    timestamp: new Date().toISOString(),
    incidentId: record.id,
    incidentType: record.submission.incidentType,
    description: record.submission.description,
    suspiciousSource: record.submission.suspiciousUrlOrSource || null,
    riskLevel: record.analysis.riskLevel,
    confidence: record.analysis.confidence,
    summary: record.analysis.summary,
    indicators: record.analysis.indicators,
    recommendedActions: record.analysis.recommendedActions,
    reasoningSummary: record.analysis.reasoningSummary,
    reporter: record.submission.reporterName || null,
    status: 'Yeni',
  };
}

export function prepareIncidentDispatchPayload(record: IncidentRecord) {
  return prepareMakeWebhookPayload(record);
}

