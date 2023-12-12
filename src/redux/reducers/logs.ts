type Action = {
  type: string;
};

export default (state = [], action: Action) => {
  if (action.type.indexOf('@@redux') !== 0) {
    return [action.type, ...state];
  } else {
    return state;
  }
};
