import createStoresDispatcher from '@api/wssWorker/StoresDispatcher';
import PublicApi, { PublicApiMethods } from '@api/public.api';

createStoresDispatcher({ isTuneSameCh: true, isTuneMultiCh: true }).then((storesDispatcher) => {
  window.talknAPI = new PublicApi(storesDispatcher) as PublicApiMethods;
});
