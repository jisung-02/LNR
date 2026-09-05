import { test, expect } from '@playwright/test';

async function checkWidth(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test('local preview completes without devices or camera and resets the session', async ({
  page,
}) => {
  const errors = [];
  const deviceRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes(':8000')) deviceRequests.push(request.url());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException('Permission denied', 'NotAllowedError');
        },
      },
    });
  });
  await page.goto('/');
  await checkWidth(page);
  await page.getByRole('button', { name: '클릭해서 시작하기' }).click();
  await checkWidth(page);
  await page.getByRole('button', { name: '사진 찍으러 가기' }).click();
  await expect(
    page.getByText('카메라를 사용할 수 없습니다.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '사진 촬영', exact: true }),
  ).toBeDisabled();
  await checkWidth(page);
  await page.getByRole('button', { name: '예시 사진으로 계속' }).click();
  const input = page.getByLabel('전하고 싶은 숫자 메시지');
  await input.fill('999');
  await page.getByRole('button', { name: '메시지 해독하기' }).click();
  await expect(page.getByRole('alert')).toContainText('목록에 없는');
  await page.getByRole('button', { name: '1004', exact: true }).click();
  await page.getByRole('button', { name: '메시지 해독하기' }).click();
  await expect(
    page.getByRole('heading', { name: '천사', exact: true }),
  ).toBeVisible();
  await checkWidth(page);
  await page.getByRole('button', { name: '암호 다시 고르기' }).click();
  await expect(input).toHaveValue('1004');
  await input.fill('0124');
  await page.getByRole('button', { name: '메시지 해독하기' }).click();
  await expect(page.getByText('0124', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '사진 미리보기' }).click();
  await expect(
    page.getByRole('heading', { name: '사진 미리보기' }),
  ).toBeVisible();
  await expect(page.getByAltText('선택한 사진')).toBeVisible();
  expect(
    await page
      .getByAltText('선택한 사진')
      .evaluate((image) => image.complete && image.naturalWidth > 0),
  ).toBe(true);
  await checkWidth(page);
  await page.screenshot({
    path: test.info().outputPath('preview.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: '처음으로', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '클릭해서 시작하기' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(deviceRequests).toEqual([]);
});

test('camera countdown is cancelled when closing the window', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 320;
    canvas.getContext('2d').fillRect(0, 0, 320, 320);
    window.testCameraStream = canvas.captureStream(30);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => window.testCameraStream },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '클릭해서 시작하기' }).click();
  await page.getByRole('button', { name: '사진 찍으러 가기' }).click();
  await page.getByRole('button', { name: '사진 촬영', exact: true }).click();
  await page.getByRole('button', { name: '닫고 처음으로' }).click();
  await page.waitForTimeout(3500);
  await expect(
    page.getByRole('button', { name: '클릭해서 시작하기' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      window.testCameraStream
        .getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
});
