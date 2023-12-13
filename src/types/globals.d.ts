import PublicApi from '@api/public.api';

declare global {
  interface Window {
    talknAPI: PublicApi;
  }
}
