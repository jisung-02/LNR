import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, expect, it, vi } from 'vitest';
import rootReducer from './redux/rootReducer';
import InterPage from './windows/InterPage';
import PrintPage from './windows/PrintPage';
import { processPhoto } from './services/device';

vi.mock('./services/device', async (importOriginal) => ({
  ...(await importOriginal()),
  hardwareMode: true,
}));
afterEach(() => vi.unstubAllGlobals());

function mount(Page, page = 'INTERPAGE') {
  const store = createStore(rootReducer);
  store.dispatch({ type: page });
  store.dispatch({
    type: 'SAVE_PHOTO_DATA',
    payload: '0124//////영원히 사랑해',
  });
  store.dispatch({
    type: 'SET_BASE64_IMAGE',
    payload: 'data:image/jpeg;base64,YWJj',
  });
  store.dispatch({
    type: 'SET_PROCESSED_IMAGE',
    payload: 'data:image/jpeg;base64,YWJj',
  });
  const view = render(
    <Provider store={store}>
      <Page />
    </Provider>,
  );
  return { store, ...view };
}

it('keeps the message page on an unavailable device and allows retry', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ output_image: 'YWJj' })),
    );
  vi.stubGlobal('fetch', fetchMock);
  const { store } = mount(InterPage);
  fireEvent.click(screen.getByRole('button', { name: '이 메시지로 결정' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '연결할 수 없습니다',
  );
  expect(store.getState().changePage.changePage).toBe(4);
  fireEvent.click(screen.getByRole('button', { name: '이 메시지로 결정' }));
  await waitFor(() => expect(store.getState().changePage.changePage).toBe(5));
  expect(store.getState().image.processedImage).toBe(
    'data:image/jpeg;base64,YWJj',
  );
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
    file: 'YWJj',
    number: '0124',
  });
});

it('submits one processing request and ignores completion after closing', async () => {
  let resolve;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    ),
  );
  const { unmount, store } = mount(InterPage);
  const button = screen.getByRole('button', { name: '이 메시지로 결정' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(fetch).toHaveBeenCalledTimes(1);
  unmount();
  await act(async () =>
    resolve(new Response(JSON.stringify({ output_image: 'YWJj' }))),
  );
  expect(store.getState().changePage.changePage).toBe(4);
});

it('rejects HTTP errors and invalid image responses', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ output_image: null })),
      ),
  );
  await expect(
    processPhoto('data:image/jpeg;base64,YWJj', '0124'),
  ).rejects.toThrow('503');
  await expect(
    processPhoto('data:image/jpeg;base64,YWJj', '0124'),
  ).rejects.toThrow('올바른 사진');
});

it('does not report failed print requests as successful', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok')),
  );
  mount(PrintPage, 'PRINTPAGE');
  fireEvent.click(
    screen.getByRole('button', { name: '인쇄 요청', exact: true }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('500');
  expect(screen.queryByText('인쇄 요청 접수됨')).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: '인쇄 요청', exact: true }),
  );
  expect(await screen.findByRole('status')).toHaveTextContent(
    '실제 출력은 장비에서 확인',
  );
  expect(
    screen.getByRole('button', { name: '인쇄 요청 접수됨' }),
  ).toBeDisabled();
});

it('clears photos and messages when starting a new session', () => {
  const { store } = mount(PrintPage, 'PRINTPAGE');
  fireEvent.click(screen.getByRole('button', { name: '처음으로' }));
  expect(store.getState()).toEqual(rootReducer(undefined, { type: '@@INIT' }));
});
