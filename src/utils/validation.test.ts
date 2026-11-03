import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIncidentSubmission,
  normalizeRiskLevel,
  clampConfidence,
  sanitizeAnalysisResult,
  generateIncidentId,
  prepareMakeWebhookPayload,
} from './validation';
import { IncidentRecord } from '../types';

test('generateIncidentId formats CS-YYYYMMDD-HHMMSS correctly', () => {
  const fixedDate = new Date(2026, 10, 1, 13, 5, 1); // Note month is 0-indexed: 10 is November
  const id = generateIncidentId(fixedDate);
  assert.equal(id, 'CS-20261101-130501');
});

test('generateIncidentId generates string starting with CS-', () => {
  const id = generateIncidentId();
  assert.match(id, /^CS-\d{8}-\d{6}$/);
});

test('validateIncidentSubmission rejects description shorter than 20 chars', () => {
  const result = validateIncidentSubmission({
    incidentType: 'Oltalama / Phishing',
    description: 'Kısa açıklama',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.description);
});

test('validateIncidentSubmission accepts valid input with >= 20 characters', () => {
  const result = validateIncidentSubmission({
    incidentType: 'Oltalama / Phishing',
    description: 'Rektörlük adına parola sıfırlama linki içeren şüpheli e-posta aldım.',
  });
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test('validateIncidentSubmission requires incidentType', () => {
  const result = validateIncidentSubmission({
    incidentType: '',
    description: 'Bu geçerli uzunlukta bir olay açıklamasıdır.',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.incidentType);
});

test('normalizeRiskLevel maps various inputs correctly', () => {
  assert.equal(normalizeRiskLevel('Kritik'), 'Kritik');
  assert.equal(normalizeRiskLevel('CRITICAL'), 'Kritik');
  assert.equal(normalizeRiskLevel('Düşük'), 'Düşük');
  assert.equal(normalizeRiskLevel('low'), 'Düşük');
  assert.equal(normalizeRiskLevel('Orta'), 'Orta');
  assert.equal(normalizeRiskLevel('Bilinmiyor'), 'Orta');
  assert.equal(normalizeRiskLevel(null), 'Orta');
});

test('clampConfidence bounds numbers to 0-100', () => {
  assert.equal(clampConfidence(150), 100);
  assert.equal(clampConfidence(-10), 0);
  assert.equal(clampConfidence('85'), 85);
  assert.equal(clampConfidence('invalid'), 70);
});

test('sanitizeAnalysisResult guarantees complete fields', () => {
  const sanitized = sanitizeAnalysisResult(
    {
      riskLevel: 'Kritik',
      confidence: 95,
      summary: 'Parola çalma teşebbüsü.',
    },
    'Şüpheli E-posta'
  );
  assert.equal(sanitized.incidentType, 'Şüpheli E-posta');
  assert.equal(sanitized.riskLevel, 'Kritik');
  assert.equal(sanitized.confidence, 95);
  assert.ok(sanitized.indicators.length > 0);
  assert.ok(sanitized.recommendedActions.length > 0);
  assert.ok(sanitized.reasoningSummary.length > 0);
});

test('prepareMakeWebhookPayload formats exact required Make.com structure', () => {
  const dummyRecord: IncidentRecord = {
    id: 'CS-20261101-130501',
    timestamp: '2026-11-01T13:05:01.000Z',
    submission: {
      incidentType: 'Oltalama / Phishing',
      description: 'Test olay açıklaması en az 20 karakter uzunluğundadır.',
      reporterName: 'ogrenci1',
      suspiciousUrlOrSource: 'https://phish.example.com',
    },
    analysis: {
      incidentType: 'Oltalama / Phishing',
      riskLevel: 'Kritik',
      confidence: 90,
      summary: 'Oltalama vakası',
      indicators: ['Sahte oturum ekranı'],
      recommendedActions: ['Erişimi kesin'],
      reasoningSummary: 'Kullanıcı metninde net kimlik avı izleri var.',
    },
    forwardedToTeam: true,
  };

  const payload = prepareMakeWebhookPayload(dummyRecord);
  assert.equal(payload.incidentId, 'CS-20261101-130501');
  assert.equal(payload.incidentType, 'Oltalama / Phishing');
  assert.equal(payload.description, 'Test olay açıklaması en az 20 karakter uzunluğundadır.');
  assert.equal(payload.suspiciousSource, 'https://phish.example.com');
  assert.equal(payload.riskLevel, 'Kritik');
  assert.equal(payload.confidence, 90);
  assert.equal(payload.summary, 'Oltalama vakası');
  assert.deepEqual(payload.indicators, ['Sahte oturum ekranı']);
  assert.deepEqual(payload.recommendedActions, ['Erişimi kesin']);
  assert.equal(payload.reasoningSummary, 'Kullanıcı metninde net kimlik avı izleri var.');
  assert.equal(payload.reporter, 'ogrenci1');
  assert.equal(payload.status, 'Yeni');
  assert.ok(payload.timestamp);
});

