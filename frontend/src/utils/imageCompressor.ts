/**
 * imageCompressor.ts
 *
 * 스마트폰/PC에서 선택한 이미지 파일을 브라우저의 HTML5 Canvas를 이용해
 * 인스타그램 표준 해상도(1080px, 84% 고품질)로 최적화하여
 * 화질 저하 없이 선명하고 생생하게 Firestore(1MB 한도 안전)에 저장하는 유틸리티
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 ~ 1.0
}

export function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; sizeKb: number; width: number; height: number }> {
  // 🌟 인스타그램 표준 업로드 규격: 가로 1080px, 세로 최대 1350px (4:5 인스타 비율)
  const maxWidth = options.maxWidth || 1080;
  const maxHeight = options.maxHeight || 1350;
  const initialQuality = options.quality || 0.84; // 84% 품질 (시각적 손실 없는 고화질 골든 밸런스)

  return new Promise((resolve, reject) => {
    // MIME type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일(JPG, PNG, WebP, HEIC 등)만 업로드할 수 있습니다.'));
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

        // 원본 비율을 엄격히 유지하면서 최대 해상도(1080x1350) 이내로 부드럽게 다운스케일
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

        // 고품질 양방향 이미지 보간(Bicubic smoothing) 활성화
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 투명 배경이 있는 PNG인 경우 흰색 바탕으로 자연스럽게 합성
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 🌟 1차 고화질 압축 (JPEG 0.84 - 매우 선명함)
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Firestore 1MB (1,048,576 byte) 한도를 넘지 않도록 Base64 길이 체크
        // 750KB를 초과할 경우에만 품질을 0.75로 살짝 낮춰 안전하게 재압축
        if (dataUrl.length > 750 * 1024) {
          quality = 0.75;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // 최종 Base64 데이터 크기(KB) 계산
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb, width, height });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
