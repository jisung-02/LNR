import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { interPage, resetSession } from '../redux/action';
import { hardwareMode, printPhoto } from '../services/device';
import messageInterpret from '../services/messageInterpret';

export default function PrintPage() {
  const { base64Image: photo, processedImage } = useSelector(
    (state) => state.image,
  );
  const saved = useSelector((state) => state.photoData.photoData);
  const code = saved?.split('//////')[0] || '';
  const message = (messageInterpret(code) || '').split('@@')[0];
  const dispatch = useDispatch();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function print() {
    if (requestRef.current || status === 'done') return;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus('printing');
    setError('');
    try {
      await printPhoto(controller.signal);
      if (!controller.signal.aborted) setStatus('done');
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message);
        setStatus('idle');
      }
    } finally {
      requestRef.current = null;
    }
  }
  return (
    <div className="page result-page">
      <button className="back-button" onClick={() => dispatch(interPage())}>
        ← 메시지로 돌아가기
      </button>
      <h1>{hardwareMode ? '당신의 마음이 도착했어요' : '사진 미리보기'}</h1>
      {hardwareMode && processedImage ? (
        <img
          className="processed-photo"
          src={processedImage}
          alt="장비 서버에서 만든 메시지 사진"
        />
      ) : (
        <figure className="photo-print">
          <img src={photo} alt="선택한 사진" />
          <figcaption>
            <span>{code}</span>
            <strong>{message}</strong>
            <small>LOVE NEVER RETIRES</small>
          </figcaption>
        </figure>
      )}
      <p className="muted">
        {hardwareMode
          ? '연결된 프린터로 인쇄 요청을 보냅니다.'
          : '로컬 미리보기입니다. 장비의 실제 출력물과는 다를 수 있어요.'}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {status === 'done' && (
        <p role="status">
          서버가 인쇄 요청을 수락했습니다. 실제 출력은 장비에서 확인해주세요.
        </p>
      )}
      <div className="actions">
        {hardwareMode && (
          <button
            className="retro-button primary"
            onClick={print}
            disabled={!processedImage || status !== 'idle'}
          >
            {status === 'printing'
              ? '인쇄 요청 중…'
              : status === 'done'
                ? '인쇄 요청 접수됨'
                : '인쇄 요청'}
          </button>
        )}
        <button
          className="retro-button"
          onClick={() => dispatch(resetSession())}
        >
          처음으로
        </button>
      </div>
    </div>
  );
}
