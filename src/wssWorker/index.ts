import PostMessage, { MessageClientAndWsApiType, MessageParams } from '@common/PostMessage';
import { ApiStore } from '@api/redux/store';
import Request from './request';

// MEMO: ワーカーはワーカーを生成できる
export default class WssWorker {
  request: Request;
  worker: Worker;
  constructor(worker: Worker) {
    this.onMessage = this.onMessage.bind(this);
    this.onMessageError = this.onMessageError.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.worker = worker;
    this.worker.onerror = this.onMessageError;
    this.worker.onmessage = this.onMessage;
    this.request = new Request(this);
  }

  public postMessage(method: string, params: MessageParams = {}): void {
    const message: MessageClientAndWsApiType = { method, params };
    this.worker.postMessage(message);
  }
  private onMessage(e: MessageEvent): void {
    const { method, params }: MessageClientAndWsApiType = e.data;
    if (method && params) {
      this.request.exe(method, params as ApiStore);
    }
  }
  private onMessageError(e: ErrorEvent): void {
    console.warn(e);
  }
}

new WssWorker(self as any);
