const pages = {
  EXPLAINPAGE: 1,
  PHOTOPAGE: 2,
  CODEPAGE: 3,
  INTERPAGE: 4,
  PRINTPAGE: 5,
};

export default function changePageReducer(state = { changePage: 0 }, action) {
  return Object.hasOwn(pages, action.type)
    ? { changePage: pages[action.type] }
    : state;
}
