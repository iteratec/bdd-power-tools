import { StepStore } from './stepStore/stepStore';

import {
  CompletionItem,
  CompletionItemKind,
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  Position,
  ProposedFeatures,
  Range,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver';

// import { BddPowerToolsSettings } from './bddPowerToolsSettings';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

// const defaultSettings: BddPowerToolsSettings = { language: 'de' };
// let globalSettings = defaultSettings;
let stepStore: StepStore;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability = capabilities.workspace! && !!capabilities.workspace!.configuration;
  hasWorkspaceFolderCapability = capabilities.workspace! && !!capabilities.workspace!.workspaceFolders;
  stepStore = new StepStore();
  return {
    capabilities: {
      completionProvider: {
        resolveProvider: false,
      },
      textDocumentSync: documents.syncKind,
    },
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, {section: 'bddPowerTools'});
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(workspaceFolderChangedEvent => {
      connection.console.info('WorkspacefolderChanged event received');
    });
  }
  stepStore.initialize();
});

connection.onDidChangeConfiguration(change => {
  // globalSettings = ((change.settings.bddPowerTools || defaultSettings)) as BddPowerToolsSettings;
});

// connection.onDidChangeWatchedFiles(change => {
// });

connection.onCompletion((txtDocPos: TextDocumentPositionParams): CompletionItem[] => {
  const doc = documents.get(txtDocPos.textDocument.uri);
  let suggestion: CompletionItem[] = [];
  if (doc) {
    let lineToPos = doc.getText(Range.create(Position.create(txtDocPos.position.line, 0), txtDocPos.position));
    let match = /^\s*\b(Angenommen|Wenn|Dann|Und|Aber)\b/.exec(lineToPos);
    let keyword = match ? match[1] : '';
    const newPos = txtDocPos.position;
    while ((keyword === 'Und' || keyword === 'Aber') && newPos.line > 0) {
      newPos.line--;
      lineToPos = doc.getText(Range.create(Position.create(newPos.line, 0), Position.create(newPos.line, 1000)));
      match = /^\s*\b(Angenommen|Wenn|Dann)\b/.exec(lineToPos);
      keyword = match ? match[1] : '';
    }
    switch (keyword) {
      case 'Angenommen': {
        suggestion = stepStore.Given.map(s => {
          return {
            kind: CompletionItemKind.Constant,
            label: s,
          } as CompletionItem;
        });
        break;
      }
      case 'Wenn': {
        suggestion = stepStore.When.map(s => {
          return {
            kind: CompletionItemKind.Constant,
            label: s,
          } as CompletionItem;
        });
        break;
      }
      case 'Dann': {
        suggestion = stepStore.Then.map(s => {
          return {
            kind: CompletionItemKind.Constant,
            label: s,
          } as CompletionItem;
        });
        break;
      }
      default: {
        suggestion = [
          'Funktionalität: ',
          'Szenario: ',
          'Grundlage ',
          'Angenommen ',
          'Wenn ',
          'Dann ',
          'Und ',
          'Aber ',
          'Beispiele: '].map(kw => {
            return {
              kind: CompletionItemKind.Keyword,
              label: kw,
            } as CompletionItem;
          });
        break;
      }
    }
  }
  return suggestion;
});

connection.onDidChangeWatchedFiles(change => {
  connection.console.log(change.changes.map(c => c.uri).join(' | '));
});

// documents.onDidChangeContent(change => {
// });

// documents.onDidClose(e => {
//   documentSettings.delete(e.document.uri);
// });

documents.listen(connection);
connection.listen();
