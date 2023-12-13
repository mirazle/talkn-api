import Window from '@api/Window';
import PublicApi from '@api/public.api';

const apiWindow = new Window();

window.talknAPI = new Promise((resolve) => {
  apiWindow.boot().then((_window) => {
    const publicApi: PublicApi = new PublicApi(_window as Window);
    window.talknAPI = publicApi;
    resolve(publicApi);
  });
});
