import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { explainPage } from './redux/action';
import Window from './components/Window';
import { hardwareMode } from './services/device';
import './App.css';

function Desktop() {
  const page = useSelector((state) => state.changePage.changePage);
  const dispatch = useDispatch();
  return (
    <main className="desktop">
      <header className="desktop-header">
        <span>CHEREMI MAKA</span>
        <span className="mode-label">
          {hardwareMode ? '장비 연결 모드' : '로컬 미리보기 · 장비 연결 없음'}
        </span>
      </header>
      {page === 0 ? (
        <section className="welcome" aria-labelledby="welcome-title">
          <button
            className="folder-button"
            onClick={() => {
              dispatch(explainPage());
            }}
          >
            <img src="/assets/image/folder.png" alt="" />
            <span>클릭해서 시작하기</span>
          </button>
          <div className="welcome-copy">
            <p className="eyebrow">LOVE NEVER RETIRES</p>
            <h1 id="welcome-title">
              사랑에
              <br />
              은퇴는 없다
            </h1>
            <p>
              숫자로 전하던 그때의 마음.
              <br />
              사진 한 장에 담아 보내보세요.
            </p>
            <p className="welcome-note">
              사진 촬영 → 삐삐 암호 → 나만의 메시지
            </p>
          </div>
        </section>
      ) : (
        <Window />
      )}
      <footer className="desktop-footer">
        {hardwareMode
          ? '사진 처리와 인쇄에는 연결된 로컬 서버가 필요합니다.'
          : '사진은 이 브라우저에서만 처리합니다. 실제 인쇄·삐삐 전송은 하지 않습니다.'}
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Desktop />
    </Provider>
  );
}
