import React, { useRef, useState, useCallback } from 'react';
import { compressImageFile, type CompressionOptions } from '../utils/imageCompressor';

export interface PhotoResult {
  dataUrl: string;
  sizeKb: number;
  fileName: string;
  width: number;
  height: number;
}

export interface UsePhotoPickerOptions extends CompressionOptions {
  onSuccess?: (photo: PhotoResult) => void;
  onError?: (error: Error) => void;
}

/**
 * 카메라 직접 촬영 및 앨범 선택, Base64 고품질 압축을 하나로 통일하여
 * 피드 업로드와 프로필 사진 설정 모두에서 재사용 가능한 커스텀 훅
 */
export function usePhotoPicker(options: UsePhotoPickerOptions = {}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photo, setPhoto] = useState<PhotoResult | null>(null);

  const openCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const openGallery = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsProcessing(true);
        const { dataUrl, sizeKb, width, height } = await compressImageFile(file, {
          maxWidth: options.maxWidth ?? 1080,
          maxHeight: options.maxHeight ?? 1350,
          quality: options.quality ?? 0.84,
        });

        const result: PhotoResult = {
          dataUrl,
          sizeKb,
          fileName: file.name,
          width,
          height,
        };

        setPhoto(result);
        options.onSuccess?.(result);
      } catch (err: any) {
        console.error('Photo picker error:', err);
        options.onError?.(err);
        alert(err.message || '사진을 처리하는 도중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
        // 동일 파일 재선택 허용을 위해 input 초기화
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
      }
    },
    [options]
  );

  const clearPhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  // 렌더링에 삽입할 숨겨진 input 엘리먼트 2종 (카메라용 & 갤러리용)
  const hiddenInputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );

  return {
    cameraInputRef,
    galleryInputRef,
    openCamera,
    openGallery,
    handleFileChange,
    isProcessing,
    photo,
    setPhoto,
    clearPhoto,
    hiddenInputs,
  };
}

