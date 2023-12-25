import { PostMessage, OnMessage } from '@common/PostMessage';
import ToServer from './ToServer';

export const statusStop = 'stop';
export const statusBooting = 'booting';
export const statusTunning = 'tunning';
export const statusTuned = 'tuned';
export const statusRequest = 'statusRequest';
export const statusResponse = 'statusResponse';
export type Status =
  | typeof statusStop
  | typeof statusBooting
  | typeof statusTunning
  | typeof statusTuned
  | typeof statusRequest
  | typeof statusResponse;

// MEMO: ワーカーはワーカーを生成できる
export default class WssWorker {
  toServer: ToServer;
  worker: Worker;
  constructor(worker: Worker) {
    this.onMessage = this.onMessage.bind(this);
    this.onMessageError = this.onMessageError.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.worker = worker;
    this.worker.onerror = this.onMessageError;
    this.worker.onmessage = this.onMessage;
    this.toServer = new ToServer(this);
  }

  public postMessage({ pid, method, params }: PostMessage): void {
    if (pid && method) {
      this.worker.postMessage({ pid, method, params });
    }
  }

  private onMessage(e: MessageEvent): void {
    const { pid, method, params }: OnMessage = e.data;
    if (pid && method && params) {
      this.toServer.exe(pid, method, params);
    }
  }

  private onMessageError(e: ErrorEvent): void {
    console.warn(e);
  }
}

new WssWorker(self as any);
