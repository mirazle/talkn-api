import PostMessage, { MessageClientAndWsApiType, MessageParams } from '@common/PostMessage';
import Sequence from '@common/Sequence';
import { ApiStore } from '@api/redux/store';
import Wss from './';

export default class WssWorker {
  wss: Wss;
  worker: Worker;
  constructor(worker: Worker) {
    // web socket server.
    this.onMessage = this.onMessage.bind(this);
    this.onMessageError = this.onMessageError.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.worker = worker;
    this.worker.onerror = this.onMessageError;
    this.worker.onmessage = this.onMessage;
    this.wss = new Wss(this);
  }

  public postMessage(method: string, params: MessageParams = {}, methodBack?: string): void {
    const message: MessageClientAndWsApiType = {
      id: '', // TODO set id
      type: PostMessage.WSAPI_TO_CLIENT_TYPE,
      ioType: Sequence.API_SETUP,
      method,
      params,
      methodBack,
    };
    this.worker.postMessage(message);
  }
  private onMessage(e: MessageEvent): void {
    const { type, method, params }: MessageClientAndWsApiType = e.data;

    if (type === PostMessage.CLIENT_TO_WSAPI_TYPE) {
      this.wss.exe(method, params as ApiStore);
    }
  }
  private onMessageError(e: ErrorEvent): void {
    console.warn(e);
  }
}

new WssWorker(self as any);
