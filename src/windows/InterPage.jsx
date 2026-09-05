import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { codePage, printPage, setProcessedImage } from '../redux/action';
import messageInterpret from '../services/messageInterpret';
import { hardwareMode, processPhoto } from '../services/device';

export default function InterPage() {
  const saved = useSelector((state) => state.photoData.photoData);
  const photo = useSelector((state) => state.image.base64Image);
  const code = saved?.split('//////')[0] || '';
  const [message, description = ''] = (messageInterpret(code) || '').split(
    '@@',
  );
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function confirm() {
    if (requestRef.current) return;
    if (!photo || !message) {
      setError('사진과 암호를 먼저 선택해주세요.');
      return;
    }
    if (!hardwareMode) {
      dispatch(setProcessedImage(null));
      dispatch(printPage());
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError('');
    try {
      const result = await processPhoto(photo, code, controller.signal);
      if (!controller.signal.aborted) {
        dispatch(setProcessedImage(result));
        dispatch(printPage());
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        requestRef.current = null;
      }
    }
  }
  return (
    <div className="page interpretation">
      <button className="back-button" onClick={() => dispatch(codePage())}>
        ← 암호 다시 고르기
      </button>
      <p className="eyebrow">숫자 속에 숨겨둔 마음</p>
      <p className="decoded-code">{code}</p>
      <h1>{message || '암호를 먼저 입력해주세요.'}</h1>
      {description && (
        <p className="description">{description.replaceAll('##', '\n')}</p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button
        className="retro-button primary"
        onClick={confirm}
        disabled={busy || !message}
      >
        {busy
          ? '사진 처리 중…'
          : hardwareMode
            ? '이 메시지로 결정'
            : '사진 미리보기 →'}
      </button>
    </div>
  );
}
