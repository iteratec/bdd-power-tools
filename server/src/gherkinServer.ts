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
  TextEdit,
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
      documentFormattingProvider: true,
      textDocumentSync: documents.syncKind,
    },
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, {
      section: 'bddFeatureEditor',
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
  globalSettings = (change.settings.bddFeatureEditor || defaultSettings) as BddPowerToolsSettings;
  stepStore.initialize(documents, globalSettings.language);
});

connection.onDidChangeWatchedFiles(change => {
  // connection.console.log(`ChangeWatchedFiles: ${change.changes.map(c => c.uri).join(' | ')}`);
});

connection.onDocumentFormatting(
  (formattingParams): TextEdit[] => {
    const doc = documents.get(formattingParams.textDocument.uri);
    const options = formattingParams.options;
    const textEdit: TextEdit[] = [];
    if (doc) {
      let pattern = gherkin.repository.keywords.patterns.find(p => p.name.endsWith(globalSettings.language));
      let gherkinKeywords = pattern
        ? pattern.match
        : gherkin.repository.keywords.patterns.find(p => p.name.endsWith(defaultSettings.language))!.match;
      gherkinKeywords = gherkinKeywords.substring(1, gherkinKeywords.length - 1);
      const [
        keywordFeature,
        keywordBackground,
        keywordScenario,
        keywordScenarioOutline,
        keywordExamples,
      ] = gherkinKeywords.split('|');
      pattern = gherkin.repository.steps.patterns.find(p => p.name.endsWith(globalSettings.language));
      let stepKeywords = pattern
        ? pattern.match
        : gherkin.repository.steps.patterns.find(p => p.name.endsWith(defaultSettings.language))!.match;
      stepKeywords = stepKeywords.substring(1, stepKeywords.length - 1);
      const [keywordGiven, keywordWhen, keywordThen, keywordAnd, keywordBut] = stepKeywords.split('|');
      let docStringStartline = -1;
      let hasTag = false;
      let tagPosition = 0;
      let tagLine = 0;
      let hasComment = false;
      let commentPosition = 0;
      let commentLine = 0;
      for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
        const lineRange = Range.create(Position.create(lineNumber, 0), Position.create(lineNumber + 1, 0));
        const line = doc.getText(lineRange);
        const regexp = `^(\\s*)(# language:|${gherkinKeywords}|${stepKeywords}|\\||"{3}|@|#).*`;
        const match = new RegExp(regexp).exec(line);
        if (match) {
          switch (match[2]) {
            case '# language:':
            case keywordFeature:
              if (match[1]) {
                if (hasTag) {
                  textEdit.push(
                    TextEdit.del(Range.create(Position.create(tagLine, 0), Position.create(tagLine, tagPosition))),
                  );
                  hasTag = false;
                }
                if (hasComment) {
                  textEdit.push(
                    TextEdit.del(
                      Range.create(Position.create(commentLine, 0), Position.create(commentLine, commentPosition)),
                    ),
                  );
                  hasComment = false;
                }
                textEdit.push(
                  TextEdit.del(
                    Range.create(Position.create(lineNumber, 0), Position.create(lineNumber, match[1].length)),
                  ),
                );
              }
              break;
            case keywordBackground:
            case keywordScenario:
            case keywordScenarioOutline:
            case keywordExamples:
              if (match[1]) {
                let spacing: string;
                if (options.insertSpaces) {
                  spacing = new Array(options.tabSize).fill(' ').join('');
                } else {
                  spacing = '\t';
                }
                if (hasTag) {
                  textEdit.push(
                    TextEdit.replace(
                      Range.create(Position.create(tagLine, 0), Position.create(tagLine, tagPosition)),
                      spacing,
                    ),
                  );
                  hasTag = false;
                }
                if (hasComment) {
                  textEdit.push(
                    TextEdit.replace(
                      Range.create(Position.create(commentLine, 0), Position.create(commentLine, commentPosition)),
                      spacing,
                    ),
                  );
                  hasComment = false;
                }
                textEdit.push(
                  TextEdit.replace(
                    Range.create(Position.create(lineNumber, 0), Position.create(lineNumber, match[1].length)),
                    spacing,
                  ),
                );
              }
              break;
            case keywordAnd:
            case keywordBut:
            case keywordGiven:
            case keywordThen:
            case keywordWhen:
              if (match[1]) {
                let spacing: string;
                if (options.insertSpaces) {
                  spacing = new Array(options.tabSize * 2).fill(' ').join('');
                } else {
                  spacing = '\t\t';
                }
                textEdit.push(
                  TextEdit.replace(
                    Range.create(Position.create(lineNumber, 0), Position.create(lineNumber, match[1].length)),
                    spacing,
                  ),
                );
              }
              break;
            case '|':
              if (match[1]) {
                let spacing: string;
                if (options.insertSpaces) {
                  spacing = new Array(options.tabSize * 3).fill(' ').join('');
                } else {
                  spacing = new Array(3).fill('\t').join('');
                }
                textEdit.push(
                  TextEdit.replace(
                    Range.create(Position.create(lineNumber, 0), Position.create(lineNumber, match[1].length)),
                    spacing,
                  ),
                );
              }
              break;
            case '"""':
              if (match[1]) {
                let spacing: string;
                if (docStringStartline < 0) {
                  docStringStartline = lineNumber;
                } else {
                  if (options.insertSpaces) {
                    spacing = new Array(options.tabSize * 3).fill(' ').join('');
                  } else {
                    spacing = new Array(3).fill('\t').join('');
                  }
                  for (let docstringline = docStringStartline; docstringline <= lineNumber; docstringline++) {
                    textEdit.push(
                      TextEdit.replace(
                        Range.create(
                          Position.create(docstringline, 0),
                          Position.create(docstringline, match[1].length),
                        ),
                        spacing,
                      ),
                    );
                  }
                }
              }
              break;
            case '@':
              if (match[1]) {
                hasTag = true;
                tagPosition = match[1].length;
                tagLine = lineNumber;
              }
              break;
            case '#':
              if (match[1]) {
                hasComment = true;
                commentPosition = match[1].length;
                commentLine = lineNumber;
              }
              break;
          }
        }
      }
    }
    return textEdit;
  },
);

// documents.onDidChangeContent(change => {
//   connection.console.log(`ChangeContent: ${change.document.uri}`);
// });

// documents.onDidClose(e => {
//   documentSettings.delete(e.document.uri);
// });

documents.listen(connection);
connection.listen();
