import * as path from 'path';
import { ExtensionContext, FileSystemWatcher, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

let client: LanguageClient;
let fileEvents: FileSystemWatcher;

export function activate(context: ExtensionContext): void {
  const gherkinServer = context.asAbsolutePath(
    path.join('node_modules', 'gherkin-language-server', 'lib', 'server.js')
  );
  const debugOtions = { execArgv: ['--nolazy', '--inspect=6009'] };
  const serverOptions: ServerOptions = {
    run: { module: gherkinServer, transport: TransportKind.ipc },
    debug: { module: gherkinServer, transport: TransportKind.ipc, options: debugOtions },
  };
  fileEvents = workspace.createFileSystemWatcher('**/*.feature');
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'gherkin' }],
    synchronize: { fileEvents },
  };
  client = new LanguageClient('BDD Feature Editor', serverOptions, clientOptions);
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  fileEvents.dispose();
  return client.stop();
}
