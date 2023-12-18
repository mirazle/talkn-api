import Manager from '@api/Manager';
import PublicApi from '@api/public.api';

const manager = new Manager();

window.talknAPI = new Promise((resolve) => {
  manager.boot().then((_window) => {
    const publicApi: PublicApi = new PublicApi(_window as Manager);
    resolve(publicApi);
  });
});
