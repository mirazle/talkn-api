import { configureStore } from '@reduxjs/toolkit';

import apiMiddlewares from '@redux/middleware';
import apiReducers from '@redux/reducers';

declare global {
  interface Module {
    hot: any;
  }
}

export type ReduxState = ReturnType<typeof apiReducers>;
export type ReduxStateKeys = keyof ReduxState;
export type ApiStore = ReturnType<typeof configureStore>;

const apiStore = configureStore({
  reducer: apiReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiMiddlewares),
});

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('@redux/reducers', () => {
    const newRootReducer = require('@redux/reducers').default;
    apiStore.replaceReducer(newRootReducer);
  });
}

export default apiStore;
