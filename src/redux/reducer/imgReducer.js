import { SET_BASE64_IMAGE, SET_PROCESSED_IMAGE } from '../action';

const initialState = {
  base64Image: null, // Base64 인코딩된 이미지 데이터를 저장
  processedImage: null, // 처리된 이미지를 저장
};

const imageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BASE64_IMAGE:
      return {
        ...state,
        base64Image: action.payload,
      };
    case SET_PROCESSED_IMAGE:
      return {
        ...state,
        processedImage: action.payload,
      };
    default:
      return state;
  }
};

export default imageReducer;
