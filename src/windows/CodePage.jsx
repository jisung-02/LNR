import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { photoPage, interPage, savePhotoData } from '../redux/action';
import messageInterpret from '../services/messageInterpret';

export default function CodePage() {
  const saved = useSelector((state) => state.photoData.photoData);
  const dispatch = useDispatch();
  const [code, setCode] = useState(saved?.split('//////')[0] || '');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const message = messageInterpret(code);
    if (!message) {
      setError('목록에 없는 메시지입니다. 아래 예시 중 하나를 선택해보세요.');
      return;
    }
    dispatch(savePhotoData(`${code}//////${message}`));
    dispatch(interPage());
  }
  return (
    <form className="page code-page" onSubmit={submit}>
      <button
        type="button"
        className="back-button"
        onClick={() => dispatch(photoPage())}
      >
        ← 다시 촬영하기
      </button>
      <h1>당신의 삐삐 암호는?</h1>
      <label htmlFor="codeInput">전하고 싶은 숫자 메시지</label>
      <input
        id="codeInput"
        className="code-input"
        inputMode="numeric"
        autoComplete="off"
        maxLength={9}
        value={code}
        aria-invalid={!!error}
        aria-describedby="code-help"
        onChange={(event) => {
          setCode(event.target.value.replace(/\D/g, ''));
          setError('');
        }}
        placeholder="486"
      />
      <p id="code-help" className="muted">
        앞자리 0도 그대로 입력해주세요.
      </p>
      <div className="code-examples" aria-label="암호 예시">
        {['486', '1004', '0124', '001', '143'].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => {
              setCode(value);
              setError('');
            }}
          >
            {value}
          </button>
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="retro-button primary" type="submit">
        메시지 해독하기 →
      </button>
    </form>
  );
}
