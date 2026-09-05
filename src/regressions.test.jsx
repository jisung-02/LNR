import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';
import rootReducer from './redux/rootReducer';
import InterPage from './windows/InterPage';
import WebcamView from './components/WebcamView';
import messageInterpret from './services/messageInterpret';

function renderWithStore(component, actions = []) {
  const store = createStore(rootReducer);
  actions.forEach((action) => store.dispatch(action));
  return render(<Provider store={store}>{component}</Provider>);
}

describe('existing regressions', () => {
  it('does not interpret inherited object properties as pager messages', () => {
    expect(messageInterpret('constructor')).toBe(false);
    expect(messageInterpret('__proto__')).toBe(false);
    expect(messageInterpret('0124')).toBe('영원히 사랑해');
  });

  it('renders a message without optional explanatory text', () => {
    renderWithStore(<InterPage />, [
      { type: 'SAVE_PHOTO_DATA', payload: '1004//////천사' },
    ]);
    expect(screen.getByText('천사')).toBeInTheDocument();
  });

  it('stops a camera stream that arrives after unmount', async () => {
    let resolveStream;
    const stop = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () =>
          new Promise((resolve) => {
            resolveStream = resolve;
          }),
      },
    });
    const { unmount } = renderWithStore(<WebcamView />);
    unmount();
    await act(async () => resolveStream({ getTracks: () => [{ stop }] }));
    expect(stop).toHaveBeenCalledOnce();
  });
});
