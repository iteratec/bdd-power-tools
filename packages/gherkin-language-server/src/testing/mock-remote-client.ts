import {
  BulkRegistration,
  BulkUnregistration,
  Disposable,
  IConnection,
  NotificationType,
  NotificationType0,
  RemoteClient,
  RequestType,
  RequestType0,
} from 'vscode-languageserver';

export class MockRemoteClient implements RemoteClient {
  connection: IConnection;
  register<RO>(type: NotificationType0<RO>, registerParams?: RO): Promise<Disposable>;
  register<P, RO>(type: NotificationType<P, RO>, registerParams?: RO): Promise<Disposable>;
  register<RO>(
    unregisteration: BulkUnregistration,
    type: NotificationType0<RO>,
    registerParams?: RO
  ): Promise<BulkUnregistration>;
  register<P, RO>(
    unregisteration: BulkUnregistration,
    type: NotificationType<P, RO>,
    registerParams?: RO
  ): Promise<BulkUnregistration>;
  register<R, E, RO>(type: RequestType0<R, E, RO>, registerParams?: RO): Promise<Disposable>;
  register<P, R, E, RO>(type: RequestType<P, R, E, RO>, registerParams?: RO): Promise<Disposable>;
  register<R, E, RO>(
    unregisteration: BulkUnregistration,
    type: RequestType0<R, E, RO>,
    registerParams?: RO
  ): Promise<BulkUnregistration>;
  register<P, R, E, RO>(
    unregisteration: BulkUnregistration,
    type: RequestType<P, R, E, RO>,
    registerParams?: RO
  ): Promise<BulkUnregistration>;
  register(registrations: BulkRegistration): Promise<BulkUnregistration>;
  register(unregisteration: any, type?: any, registerParams?: any) {
    throw new Error('Method not implemented.');
  }
}
