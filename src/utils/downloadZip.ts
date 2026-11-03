/**
 * CyberShield AI - Güvenli ve Doğrulanmış ZIP İndirme Yardımcısı
 *
 * Tarayıcı iframe kısıtlamalarını ve HTML yönlendirmelerini aşmak için:
 * İkili veriyi Base64 / ArrayBuffer olarak alır, 'PK' sihirli baytlarını
 * doğrular ve hakiki bir .zip dosyası olarak kullanıcıya teslim eder.
 */
export async function downloadCleanProjectZip(): Promise<{ success: boolean; sizeKb: number; filename: string }> {
  try {
    // 1. Base64 endpoint'inden tam ikili veriyi talep et (iframe ve servis iş parçacığı korumalı)
    const response = await fetch('/api/download-zip-base64', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sunucudan yanıt alınamadı (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.base64) {
      throw new Error('Geçersiz zip veri yükü.');
    }

    // Base64 dizesini doğrudan ikili byte dizisine dönüştür
    const binaryString = window.atob(data.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // ZIP Başlık Doğrulaması (PK.. sihirli baytları: 0x50, 0x4B)
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error('İndirilen dosya geçerli bir ZIP arşivi formatında değil.');
    }

    // Hakiki application/zip Blobu oluştur
    const blob = new Blob([bytes], { type: 'application/zip' });
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = data.filename || 'cybershield-ai.zip';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);

    return {
      success: true,
      sizeKb: Math.round((data.size || bytes.length) / 1024),
      filename: data.filename || 'cybershield-ai.zip',
    };
  } catch (err: unknown) {
    console.error('[CyberShield AI] ZIP indirme hatası:', err);
    // Yedek doğrudan indirme denemesi
    window.location.href = '/download-zip';
    throw err;
  }
}
