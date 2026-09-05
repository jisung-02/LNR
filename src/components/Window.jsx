import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSession } from '../redux/action';
import ExplainPage from '../windows/ExplainPage';
import PhotoPage from '../windows/PhotoPage';
import CodePage from '../windows/CodePage';
import InterPage from '../windows/InterPage';
import PrintPage from '../windows/PrintPage';

const pages = [null, ExplainPage, PhotoPage, CodePage, InterPage, PrintPage];
const titles = [
  '',
  '우리만의 비밀 메시지',
  '사진 촬영',
  '삐삐 암호 입력',
  '메시지 해독',
  '사진 완성',
];

export default function Window() {
  const page = useSelector((state) => state.changePage.changePage);
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const Page = pages[page];
  useEffect(() => {
    contentRef.current?.focus();
  }, [page]);
  return (
    <section className="window" aria-label="메시지 만들기">
      <header className="window-titlebar">
        <span>CHEREMI MAKA / {titles[page]}</span>
        <button
          className="close-button"
          aria-label="닫고 처음으로"
          onClick={() => dispatch(resetSession())}
        >
          ×
        </button>
      </header>
      <div className="window-content" ref={contentRef} tabIndex={-1}>
        <p className="step-label">STEP {String(page).padStart(2, '0')} / 05</p>
        {Page && <Page />}
      </div>
    </section>
  );
}
