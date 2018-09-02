import { StepStore } from './stepStore/stepStore';

import {
  CompletionItem,
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  ProposedFeatures,
  TextDocument,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver';

import { GherkinServerSettings } from './gherkinServerSettings';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

const defaultSettings: GherkinServerSettings = { featurePath: './e2e/features/**.feature' };
let globalSettings = defaultSettings;
const documentSettings: Map<string, Thenable<GherkinServerSettings>> = new Map();
let stepStore: StepStore;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability = capabilities.workspace! && !!capabilities.workspace!.configuration;
  hasWorkspaceFolderCapability = capabilities.workspace! && !!capabilities.workspace!.workspaceFolders;

  stepStore = new StepStore(globalSettings.featurePath);
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
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(workspaceFolderChangedEvent => {
      connection.console.log('WorkspacefolderChanged event received');
    });
  }
});

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    documentSettings.clear();
  } else {
    globalSettings = ((change.settings.gherkinSettings || defaultSettings)) as GherkinServerSettings;
  }
});

documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

connection.onDidChangeWatchedFiles(change => {
  // TODO: parse feature files and update data

});

connection.onCompletion((txtDocPos: TextDocumentPositionParams): CompletionItem[] => {

  return [
  ];
});

documents.listen(connection);
connection.listen();
