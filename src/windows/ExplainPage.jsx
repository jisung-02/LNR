import { useDispatch } from 'react-redux';
import { photoPage } from '../redux/action';

export default function ExplainPage() {
  const dispatch = useDispatch();
  return (
    <div className="page explanation">
      <h1>쉿! 우리만의 비밀 메시지</h1>
      <p className="lead">
        말로 하기 쑥스러웠던 마음,
        <br />
        삐삐 암호로 전해볼까요?
      </p>
      <ol className="instructions">
        <li>
          <span>01</span>
          <div>
            <strong>마음을 담아 한 컷</strong>
            <p>
              카메라로 사진을 찍어요. 카메라 없이 예시 사진으로 체험할 수도
              있어요.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>숫자로 전하는 진심</strong>
            <p>486, 1004, 0124… 나만의 삐삐 암호를 골라요.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>오래 간직할 메시지</strong>
            <p>해독한 메시지를 사진으로 확인해요.</p>
          </div>
        </li>
      </ol>
      <button
        className="retro-button primary"
        onClick={() => dispatch(photoPage())}
      >
        사진 찍으러 가기 →
      </button>
    </div>
  );
}
