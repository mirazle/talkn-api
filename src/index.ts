import Window from './Window';
import { PublicApi } from './public.api';

declare global {
  interface Window {
    talknWindow: any;
    talknMedia: any;
    talknAPI: any;
    Youtube: any;
    log: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
  interface Math {
    easeInOutQuad: any;
  }
}

const script = document.currentScript;
const apiWindow = new Window();

window.talknAPI = new Promise((resolve) => {
  apiWindow.boot().then((_window) => {
    const talknAPI: PublicApi = new PublicApi(_window as Window);
    window.talknAPI = talknAPI;
    resolve(talknAPI);
  });
});
