import { combineReducers } from 'redux';
import changePageReducer from './reducer/changePageReducer';
import codeTextReducer from './reducer/codeTextReducer';
import imageReducer from './reducer/imgReducer';

const combinedReducer = combineReducers({
  changePage: changePageReducer,
  photoData: codeTextReducer,
  image: imageReducer,
});

export default function rootReducer(state, action) {
  return combinedReducer(
    action.type === 'RESET_SESSION' ? undefined : state,
    action,
  );
}
