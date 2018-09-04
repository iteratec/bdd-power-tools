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

import { BddPowerToolsSettings } from './bddPowerToolsSettings';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

const defaultSettings: BddPowerToolsSettings = { featureGlob: 'features/**/*.feature' };
let globalSettings = defaultSettings;
const documentSettings: Map<string, Thenable<BddPowerToolsSettings>> = new Map();
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
  stepStore.initialize(globalSettings.featureGlob).then(() => {
    connection.console.info(`Then: ${stepStore.Then.join(' | ')}`);
  });
  connection.console.info(documents.keys().join(', '));
});

connection.onDidChangeConfiguration(change => {
  globalSettings = ((change.settings.bddPowerTools || defaultSettings)) as BddPowerToolsSettings;
  stepStore.initialize(globalSettings.featureGlob).then(() => {
    connection.console.info(`Then: ${stepStore.Then.join(' | ')}`);
  });
});

connection.onDidChangeWatchedFiles(change => {
  connection.console.info(change.changes.join(', '));
});

connection.onCompletion((txtDocPos: TextDocumentPositionParams): CompletionItem[] => {
  connection.console
    .info(`Completion requested in ${txtDocPos.textDocument.uri}` + ' ' +
          `at ${txtDocPos.position.line}/${txtDocPos.position.character}`);
  const doc = documents.get(txtDocPos.textDocument.uri);
  let suggestion: CompletionItem[] = [];
  if (doc) {
    const lineToPos = doc.getText(Range.create(Position.create(txtDocPos.position.line, 0), txtDocPos.position));
    const match = /\s*\b(Angenommen|Wenn|Dann)\b/.exec(lineToPos);
    const keyword = match ? match[1] : '';
    connection.console.info(`Keyword: ${keyword}`);
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
  connection.console.info(suggestion.join(' | '));
  return suggestion;
});

documents.onDidChangeContent(change => {
  connection.console.info(change.document.getText());
});

documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

documents.listen(connection);
connection.listen();
