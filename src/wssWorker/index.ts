import ApiState from '@api/state';
import ToServer from './ToServer';

export type Pid = string;
export type TuneId = string;

export type PostMessage = {
  tuneId: TuneId;
  method: string;
  pid?: Pid;
  apiState?: Partial<ApiState>;
};

export type OnMessage = PostMessage;

export const statusTunning = 'tunning';
export const statusTuned = 'tuned';
export const statusUnTunning = 'untunning';
export const statusRequesting = 'requesting';
export const statusResponsing = 'responsing';
export const statusResponsed = 'responsed';
export const statusDispatching = 'dispatching';
export const statusDispatched = 'dispatched';
export type Status =
  | typeof statusTunning
  | typeof statusTuned
  | typeof statusUnTunning
  | typeof statusRequesting
  | typeof statusResponsing
  | typeof statusResponsed
  | typeof statusDispatching
  | typeof statusDispatched;

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

  public postMessage({ pid, tuneId, method, apiState }: PostMessage): void {
    if (pid && tuneId && method) {
      this.worker.postMessage({ pid, tuneId, method, apiState });
    }
  }

  private onMessage(e: MessageEvent): void {
    const { pid, tuneId, method, apiState }: OnMessage = e.data;
    if (pid && tuneId && method && apiState) {
      this.toServer.exe(pid, tuneId, method, apiState);
    }
  }

  private onMessageError(e: ErrorEvent): void {
    console.warn(e);
  }
}

new WssWorker(self as any);
