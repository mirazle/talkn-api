import { PublicApiMethods } from '../../src/public.api';

declare global {
  interface Window {
    talknAPI: PublicApiMethods;
  }
}
