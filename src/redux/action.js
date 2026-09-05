export const explainPage = () => ({ type: 'EXPLAINPAGE' });
export const photoPage = () => ({ type: 'PHOTOPAGE' });
export const codePage = () => ({ type: 'CODEPAGE' });
export const interPage = () => ({ type: 'INTERPAGE' });
export const printPage = () => ({ type: 'PRINTPAGE' });
export const resetSession = () => ({ type: 'RESET_SESSION' });
export const savePhotoData = (payload) => ({
  type: 'SAVE_PHOTO_DATA',
  payload,
});
export const SET_BASE64_IMAGE = 'SET_BASE64_IMAGE';
export const SET_PROCESSED_IMAGE = 'SET_PROCESSED_IMAGE';
export const setBase64Image = (payload) => ({
  type: SET_BASE64_IMAGE,
  payload,
});
export const setProcessedImage = (payload) => ({
  type: SET_PROCESSED_IMAGE,
  payload,
});
