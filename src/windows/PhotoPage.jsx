import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  explainPage,
  codePage,
  setBase64Image,
  setProcessedImage,
} from '../redux/action';
import WebcamView from '../components/WebcamView';

export default function PhotoPage() {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  function selectPhoto(image) {
    dispatch(setBase64Image(image));
    dispatch(setProcessedImage(null));
    dispatch(codePage());
  }
  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
        return;
      }
      const video = videoRef.current;
      if (!video?.videoWidth || !video.videoHeight || video.readyState < 2) {
        setError('카메라 영상이 준비되지 않았습니다. 다시 촬영해주세요.');
        setCountdown(null);
        return;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        dispatch(setBase64Image(canvas.toDataURL('image/jpeg', 0.9)));
        dispatch(setProcessedImage(null));
        dispatch(codePage());
      } catch {
        setError('사진을 촬영하지 못했습니다. 다시 시도해주세요.');
        setCountdown(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, dispatch]);
  return (
    <div className="page">
      <button className="back-button" onClick={() => dispatch(explainPage())}>
        ← 뒤로가기
      </button>
      <h1>마음을 담아, 찰칵!</h1>
      <WebcamView videoRef={videoRef} onReady={() => setReady(true)} />
      <p role="status" className="capture-status">
        {countdown
          ? `${countdown}초 후 촬영합니다`
          : ready
            ? '준비되면 촬영 버튼을 눌러주세요.'
            : '카메라 연결을 기다리는 중입니다.'}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <button
          className="retro-button primary"
          disabled={!ready || countdown !== null}
          onClick={() => {
            setError('');
            setCountdown(3);
          }}
        >
          사진 촬영
        </button>
        <button
          className="retro-button"
          disabled={countdown !== null}
          onClick={() => selectPhoto('/assets/image/inner_photo_example.png')}
        >
          예시 사진으로 계속
        </button>
      </div>
    </div>
  );
}
