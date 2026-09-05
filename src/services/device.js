import messageInterpret from './messageInterpret';

export const hardwareMode = import.meta.env.VITE_DEVICE_MODE === 'hardware';
const apiUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      signal: AbortSignal.any([
        AbortSignal.timeout(15000),
        ...(options.signal ? [options.signal] : []),
      ]),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(
      '로컬 장비 서버에 연결할 수 없습니다. 서버와 연결 상태를 확인해주세요.',
      { cause: error },
    );
  }
  if (!response.ok)
    throw new Error(
      `장비 서버 요청이 실패했습니다 (${response.status}). 다시 시도해주세요.`,
    );
  return response;
}

export async function processPhoto(photo, code, signal) {
  if (!photo || !messageInterpret(code))
    throw new Error('사진과 올바른 암호가 필요합니다.');
  // The bundled example is read locally before sending the existing base64 API payload.
  let source = photo;
  if (source.startsWith('/assets/')) {
    const response = await fetch(source, { signal });
    if (!response.ok) throw new Error('예시 사진을 불러오지 못했습니다.');
    const blob = await response.blob();
    source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('사진을 읽지 못했습니다.'));
      reader.readAsDataURL(blob);
    });
  }
  const response = await request('/process-image/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: source.replace(/^data:image\/[a-z]+;base64,/, ''),
      number: code,
    }),
    signal,
  });
  const result = await response.json();
  if (
    typeof result.output_image !== 'string' ||
    !result.output_image ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(result.output_image)
  ) {
    throw new Error('장비 서버가 올바른 사진을 반환하지 않았습니다.');
  }
  return `data:image/jpeg;base64,${result.output_image}`;
}

export async function printPhoto(signal) {
  await request('/print/', { method: 'GET', signal });
}
