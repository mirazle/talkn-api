import define from '@common/define';
import createStoresDispatcher, { Options } from '@api/wssWorker/StoresDispatcher';
import PublicApi, { PublicApiMethods } from '@api/public.api';

const { hostname, search, protocol } = location;
const { PRODUCTION_DOMAIN, DEVELOPMENT_DOMAIN } = define;
const isAcceptOption = true; //(protocol === 'https:' && hostname.startsWith(PRODUCTION_DOMAIN)) || hostname.startsWith(DEVELOPMENT_DOMAIN);
const searchParams = new URLSearchParams(search);

const isTuneSameCh = Boolean(isAcceptOption && searchParams.get('isTuneSameCh') === '1');
const isTuneMultiCh = Boolean(isAcceptOption && searchParams.get('isTuneMultiCh') === '1');
const options = { isTuneSameCh, isTuneMultiCh };

createStoresDispatcher(options).then((storesDispatcher) => {
  window.talknAPI = new PublicApi(storesDispatcher) as PublicApiMethods;
});
