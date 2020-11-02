import {
  CancellationToken,
  CodeAction,
  CodeActionParams,
  CodeLens,
  CodeLensParams,
  ColorInformation,
  ColorPresentation,
  ColorPresentationParams,
  Command,
  CompletionItem,
  CompletionList,
  CompletionParams,
  DeclarationParams,
  DefinitionParams,
  DidChangeConfigurationParams,
  DidChangeTextDocumentParams,
  DidChangeWatchedFilesParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DidSaveTextDocumentParams,
  Disposable,
  DocumentColorParams,
  DocumentFormattingParams,
  DocumentHighlight,
  DocumentHighlightParams,
  DocumentLink,
  DocumentLinkParams,
  DocumentOnTypeFormattingParams,
  DocumentRangeFormattingParams,
  DocumentSymbol,
  DocumentSymbolParams,
  ExecuteCommandParams,
  FoldingRange,
  FoldingRangeParams,
  GenericNotificationHandler,
  GenericRequestHandler,
  Hover,
  HoverParams,
  IConnection,
  ImplementationParams,
  InitializeError,
  InitializeParams,
  InitializeResult,
  InitializedParams,
  Location,
  LocationLink,
  NotificationHandler,
  NotificationHandler0,
  NotificationType,
  NotificationType0,
  PrepareRenameParams,
  ProgressType,
  PublishDiagnosticsParams,
  Range,
  ReferenceParams,
  RemoteClient,
  RemoteConsole,
  RenameParams,
  RequestHandler,
  RequestHandler0,
  RequestType,
  RequestType0,
  SelectionRange,
  SelectionRangeParams,
  ServerRequestHandler,
  SignatureHelp,
  SignatureHelpParams,
  StarNotificationHandler,
  StarRequestHandler,
  SymbolInformation,
  Telemetry,
  TextEdit,
  Tracer,
  TypeDefinitionParams,
  WillSaveTextDocumentParams,
  WorkspaceEdit,
  WorkspaceSymbolParams,
  _,
  _Languages,
  _RemoteWindow,
  _RemoteWorkspace,
} from 'vscode-languageserver';
import { Configuration } from 'vscode-languageserver/lib/configuration';
import { WindowProgress } from 'vscode-languageserver/lib/progress';
import { WorkspaceFolders } from 'vscode-languageserver/lib/workspaceFolders';

export class MockConnection implements IConnection {
  listen(): void {
    throw new Error('Method not implemented.');
  }
  onRequest<R, E, RO>(type: RequestType0<R, E, RO>, handler: RequestHandler0<R, E>): void;
  onRequest<P, R, E, RO>(type: RequestType<P, R, E, RO>, handler: RequestHandler<P, R, E>): void;
  onRequest<R, E>(method: string, handler: GenericRequestHandler<R, E>): void;
  onRequest(handler: StarRequestHandler): void;
  onRequest(method: any, handler?: any) {
    throw new Error('Method not implemented.');
  }
  sendRequest<R, E, RO>(type: RequestType0<R, E, RO>, token?: CancellationToken): Promise<R>;
  sendRequest<P, R, E, RO>(type: RequestType<P, R, E, RO>, params: P, token?: CancellationToken): Promise<R>;
  sendRequest<R>(method: string, token?: CancellationToken): Promise<R>;
  sendRequest<R>(method: string, params: any, token?: CancellationToken): Promise<R>;
  sendRequest(method: any, params?: any, token?: any) {
    throw new Error('Method not implemented.');
  }
  onNotification<RO>(type: NotificationType0<RO>, handler: NotificationHandler0): void;
  onNotification<P, RO>(type: NotificationType<P, RO>, handler: NotificationHandler<P>): void;
  onNotification(method: string, handler: GenericNotificationHandler): void;
  onNotification(handler: StarNotificationHandler): void;
  onNotification(method: any, handler?: any) {
    throw new Error('Method not implemented.');
  }
  sendNotification<RO>(type: NotificationType0<RO>): void;
  sendNotification<P, RO>(type: NotificationType<P, RO>, params: P): void;
  sendNotification(method: string, params?: any): void;
  sendNotification(method: any, params?: any) {
    throw new Error('Method not implemented.');
  }
  onProgress<P>(type: ProgressType<P>, token: string | number, handler: NotificationHandler<P>): Disposable {
    throw new Error('Method not implemented.');
  }
  sendProgress<P>(type: ProgressType<P>, token: string | number, value: P): void {
    throw new Error('Method not implemented.');
  }
  onInitialize(handler: ServerRequestHandler<InitializeParams, InitializeResult<any>, never, InitializeError>): void {
    throw new Error('Method not implemented.');
  }
  onInitialized(handler: NotificationHandler<InitializedParams>): void {
    throw new Error('Method not implemented.');
  }
  onShutdown(handler: RequestHandler0<void, void>): void {
    throw new Error('Method not implemented.');
  }
  onExit(handler: NotificationHandler0): void {
    throw new Error('Method not implemented.');
  }
  console: RemoteConsole & _;
  tracer: Tracer & _;
  telemetry: Telemetry & _;
  client: RemoteClient & _;
  window: _RemoteWindow & WindowProgress & _;
  workspace: _RemoteWorkspace & Configuration & WorkspaceFolders & _;
  languages: _Languages & _;
  onDidChangeConfiguration(handler: NotificationHandler<DidChangeConfigurationParams>): void {
    throw new Error('Method not implemented.');
  }
  onDidChangeWatchedFiles(handler: NotificationHandler<DidChangeWatchedFilesParams>): void {
    throw new Error('Method not implemented.');
  }
  onDidOpenTextDocument(handler: NotificationHandler<DidOpenTextDocumentParams>): void {
    throw new Error('Method not implemented.');
  }
  onDidChangeTextDocument(handler: NotificationHandler<DidChangeTextDocumentParams>): void {
    throw new Error('Method not implemented.');
  }
  onDidCloseTextDocument(handler: NotificationHandler<DidCloseTextDocumentParams>): void {
    throw new Error('Method not implemented.');
  }
  onWillSaveTextDocument(handler: NotificationHandler<WillSaveTextDocumentParams>): void {
    throw new Error('Method not implemented.');
  }
  onWillSaveTextDocumentWaitUntil(handler: RequestHandler<WillSaveTextDocumentParams, TextEdit[], void>): void {
    throw new Error('Method not implemented.');
  }
  onDidSaveTextDocument(handler: NotificationHandler<DidSaveTextDocumentParams>): void {
    throw new Error('Method not implemented.');
  }
  sendDiagnostics(params: PublishDiagnosticsParams): void {
    throw new Error('Method not implemented.');
  }
  onHover(handler: ServerRequestHandler<HoverParams, Hover, never, void>): void {
    throw new Error('Method not implemented.');
  }
  onCompletion(
    handler: ServerRequestHandler<CompletionParams, CompletionItem[] | CompletionList, CompletionItem[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onCompletionResolve(handler: RequestHandler<CompletionItem, CompletionItem, void>): void {
    throw new Error('Method not implemented.');
  }
  onSignatureHelp(handler: ServerRequestHandler<SignatureHelpParams, SignatureHelp, never, void>): void {
    throw new Error('Method not implemented.');
  }
  onDeclaration(
    handler: ServerRequestHandler<
      DeclarationParams,
      Location | Location[] | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error('Method not implemented.');
  }
  onDefinition(
    handler: ServerRequestHandler<
      DefinitionParams,
      Location | Location[] | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error('Method not implemented.');
  }
  onTypeDefinition(
    handler: ServerRequestHandler<
      TypeDefinitionParams,
      Location | Location[] | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error('Method not implemented.');
  }
  onImplementation(
    handler: ServerRequestHandler<
      ImplementationParams,
      Location | Location[] | LocationLink[],
      Location[] | LocationLink[],
      void
    >
  ): void {
    throw new Error('Method not implemented.');
  }
  onReferences(handler: ServerRequestHandler<ReferenceParams, Location[], Location[], void>): void {
    throw new Error('Method not implemented.');
  }
  onDocumentHighlight(
    handler: ServerRequestHandler<DocumentHighlightParams, DocumentHighlight[], DocumentHighlight[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onDocumentSymbol(
    handler: ServerRequestHandler<
      DocumentSymbolParams,
      SymbolInformation[] | DocumentSymbol[],
      SymbolInformation[] | DocumentSymbol[],
      void
    >
  ): void {
    throw new Error('Method not implemented.');
  }
  onWorkspaceSymbol(
    handler: ServerRequestHandler<WorkspaceSymbolParams, SymbolInformation[], SymbolInformation[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onCodeAction(
    handler: ServerRequestHandler<CodeActionParams, (Command | CodeAction)[], (Command | CodeAction)[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onCodeLens(handler: ServerRequestHandler<CodeLensParams, CodeLens[], CodeLens[], void>): void {
    throw new Error('Method not implemented.');
  }
  onCodeLensResolve(handler: RequestHandler<CodeLens, CodeLens, void>): void {
    throw new Error('Method not implemented.');
  }
  onDocumentFormatting(handler: ServerRequestHandler<DocumentFormattingParams, TextEdit[], never, void>): void {
    throw new Error('Method not implemented.');
  }
  onDocumentRangeFormatting(
    handler: ServerRequestHandler<DocumentRangeFormattingParams, TextEdit[], never, void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onDocumentOnTypeFormatting(handler: RequestHandler<DocumentOnTypeFormattingParams, TextEdit[], void>): void {
    throw new Error('Method not implemented.');
  }
  onRenameRequest(handler: ServerRequestHandler<RenameParams, WorkspaceEdit, never, void>): void {
    throw new Error('Method not implemented.');
  }
  onPrepareRename(
    handler: RequestHandler<PrepareRenameParams, Range | { range: Range; placeholder: string }, void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onDocumentLinks(handler: ServerRequestHandler<DocumentLinkParams, DocumentLink[], DocumentLink[], void>): void {
    throw new Error('Method not implemented.');
  }
  onDocumentLinkResolve(handler: RequestHandler<DocumentLink, DocumentLink, void>): void {
    throw new Error('Method not implemented.');
  }
  onDocumentColor(
    handler: ServerRequestHandler<DocumentColorParams, ColorInformation[], ColorInformation[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onColorPresentation(
    handler: ServerRequestHandler<ColorPresentationParams, ColorPresentation[], ColorPresentation[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onFoldingRanges(handler: ServerRequestHandler<FoldingRangeParams, FoldingRange[], FoldingRange[], void>): void {
    throw new Error('Method not implemented.');
  }
  onSelectionRanges(
    handler: ServerRequestHandler<SelectionRangeParams, SelectionRange[], SelectionRange[], void>
  ): void {
    throw new Error('Method not implemented.');
  }
  onExecuteCommand(handler: ServerRequestHandler<ExecuteCommandParams, any, never, void>): void {
    throw new Error('Method not implemented.');
  }
  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
