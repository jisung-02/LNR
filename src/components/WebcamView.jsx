import { useEffect, useRef, useState } from 'react';

export default function WebcamView({
  videoRef: externalRef,
  onReady,
  onError,
}) {
  const internalRef = useRef(null);
  const videoRef = externalRef || internalRef;
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    let stream;
    const video = videoRef.current;
    async function connect() {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
      } catch {
        if (!disposed) {
          setError(
            '카메라를 사용할 수 없습니다. 브라우저 권한을 확인하거나 예시 사진으로 계속하세요.',
          );
          onError?.();
        }
      }
    }
    connect();
    return () => {
      disposed = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [videoRef, onError]);
  return (
    <div className="camera">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onLoadedData={onReady}
        aria-label="카메라 미리보기"
      />
      {error && (
        <p className="camera-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
