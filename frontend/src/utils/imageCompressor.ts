/**
 * imageCompressor.ts
 *
 * 스마트폰/PC에서 선택한 이미지 파일을 브라우저의 HTML5 Canvas를 이용해
 * Firestore 문서 한도(1MB)에 안전하게 들어가도록 고화질 100KB 내외로 자동 압축하는 유틸리티
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 ~ 1.0
}

export function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; sizeKb: number }> {
  const maxWidth = options.maxWidth || 960;
  const maxHeight = options.maxHeight || 960;
  const initialQuality = options.quality || 0.75;

  return new Promise((resolve, reject) => {
    // MIME type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽는 도중 오류가 발생했습니다.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 불러오는데 실패했습니다.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // 비율 유지하며 최대 해상도 이내로 리사이징
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context를 생성할 수 없습니다.'));
          return;
        }

        // 부드러운 이미지 리샘플링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 배경을 흰색으로 채운 후 이미지 그리기 (투명 PNG 배경 투과 방지)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 압축
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // 만에 하나 용량이 400KB를 초과하면 품질을 낮춰 재압축 (Firestore 1MB 한도 절대 안전)
        if (dataUrl.length > 400 * 1024) {
          quality = 0.6;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
