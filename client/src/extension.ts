'use strict';
import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

let client: LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // tslint:disable-next-line:no-console
    console.log('Congratulations, your extension "BDD-Power-Tools" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // });

    // context.subscriptions.push(disposable);

    const gherkinServer = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009']};
    const serverOptions: ServerOptions = {
      debug: {
        module: gherkinServer,
        options: debugOptions,
        transport: TransportKind.ipc,
      },
      run: {
        module: gherkinServer,
        transport: TransportKind.ipc,
      },
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        {scheme: 'file', language: 'gherkin'},
        {scheme: 'untitled', language: 'gherkin'},
      ],
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher('**/*.feature'),
      },
    };
    client = new LanguageClient('bdd-power-tools.gherkin-server',
                                'BDD-Power-Tools - Gherkin Server',
                                serverOptions,
                                clientOptions);
    client.start();
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
