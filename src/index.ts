import createStoresDispatcher from '@api/wssWorker/StoresDispatcher';
import PublicApi from '@api/public.api';

createStoresDispatcher().then((storesDispatcher) => {
  window.talknAPI = new PublicApi(storesDispatcher);
});
