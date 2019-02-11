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
import gherkin from './gherkin.json';
import { StepStore } from './stepStore/stepStore';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

const defaultSettings: BddPowerToolsSettings = { language: 'en' };
let globalSettings = defaultSettings;
let stepStore: StepStore;

connection.onInitialize(async (params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability = capabilities.workspace! && !!capabilities.workspace!.configuration;
  hasWorkspaceFolderCapability = capabilities.workspace! && !!capabilities.workspace!.workspaceFolders;
  stepStore = new StepStore(connection.console);
  // await stepStore.initialize(globalSettings.language);
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
    connection.client.register(DidChangeConfigurationNotification.type, {
      section: 'bddPowerTools',
    });
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(workspaceFolderChangedEvent => {
      // connection.console.info('WorkspacefolderChanged event received');
    });
  }
});

connection.onCompletion(
  (txtDocPos: TextDocumentPositionParams): CompletionItem[] => {
    const doc = documents.get(txtDocPos.textDocument.uri);
    let suggestion: CompletionItem[] = [];
    if (doc) {
      let pattern = gherkin.repository.keywords.patterns.find(p => p.name.endsWith(globalSettings.language));
      const keywords = pattern
        ? pattern.match
        : gherkin.repository.keywords.patterns.find(p => p.name.endsWith(defaultSettings.language))!.match;
      const keywordsArray = keywords.substring(1, keywords.length - 1).split('|');
      pattern = gherkin.repository.steps.patterns.find(s => s.name.endsWith(globalSettings.language));
      const steps = pattern
        ? pattern.match
        : gherkin.repository.steps.patterns.find(p => p.name.endsWith(defaultSettings.language))!.match;
      const stepsArray = steps.substring(1, steps.length - 1).split('|');
      let lineToPos = doc.getText(Range.create(Position.create(txtDocPos.position.line, 0), txtDocPos.position));
      let match = new RegExp(`^\\s*\\b${steps}\\b`).exec(lineToPos);
      let keyword = match ? match[1] : '';
      const newPos = txtDocPos.position;
      while ((keyword === stepsArray[3] || keyword === stepsArray[4]) && newPos.line > 0) {
        newPos.line--;
        lineToPos = doc.getText(Range.create(Position.create(newPos.line, 0), Position.create(newPos.line, 1000)));
        match = new RegExp(`^\\s*\\b(${stepsArray[0]}|${stepsArray[1]}|${stepsArray[2]})\\b`).exec(lineToPos);
        keyword = match ? match[1] : keyword;
      }
      switch (keyword) {
        case stepsArray[0]: {
          suggestion = stepStore.Given.map(s => {
            return {
              kind: CompletionItemKind.Constant,
              label: s,
            } as CompletionItem;
          });
          break;
        }
        case stepsArray[1]: {
          suggestion = stepStore.When.map(s => {
            return {
              kind: CompletionItemKind.Constant,
              label: s,
            } as CompletionItem;
          });
          break;
        }
        case stepsArray[2]: {
          suggestion = stepStore.Then.map(s => {
            return {
              kind: CompletionItemKind.Constant,
              label: s,
            } as CompletionItem;
          });
          break;
        }
        default: {
          suggestion = keywordsArray.concat(stepsArray).map(kw => {
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
  },
);

connection.onDidChangeConfiguration(change => {
  // connection.console.log(`onDidChangeConfiguration: ${change.settings}`);
  globalSettings = (change.settings.bddPowerTools || defaultSettings) as BddPowerToolsSettings;
  stepStore.initialize(documents, globalSettings.language);
});

connection.onDidChangeWatchedFiles(change => {
  // connection.console.log(`ChangeWatchedFiles: ${change.changes.map(c => c.uri).join(' | ')}`);
});

// documents.onDidChangeContent(change => {
//   connection.console.log(`ChangeContent: ${change.document.uri}`);
// });

// documents.onDidClose(e => {
//   documentSettings.delete(e.document.uri);
// });

documents.listen(connection);
connection.listen();
