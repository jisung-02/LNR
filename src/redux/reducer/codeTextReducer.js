const initialState = {
  photoData: null,
};

const codeTextReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SAVE_PHOTO_DATA':
      return {
        ...state,
        photoData: action.payload,
      };
    default:
      return state;
  }
};
export default codeTextReducer;
