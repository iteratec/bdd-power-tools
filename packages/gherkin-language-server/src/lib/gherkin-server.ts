import * as fs from 'fs';
import {
  DidChangeConfigurationNotification,
  DidChangeConfigurationParams,
  DidChangeWorkspaceFoldersNotification,
  DocumentFormattingParams,
  InitializeParams,
  InitializeResult,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
  createConnection,
} from 'vscode-languageserver';
import { GherkinStreams, IGherkinOptions, makeSourceEnvelope } from '@cucumber/gherkin';
import { GherkinServerOptions } from './gherkin-server-options';
import { Readable } from 'stream';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { messages } from '@cucumber/messages';

export class GherkinServer {
  private hasConfigurationCapability = false;
  private hasWorkspaceFolderCapability = false;
  private hasDiagnosticRelatedInformationCapability = false;
  private gherkinSettings: GherkinServerOptions;
  private documentSettings = new Map<string, Thenable<GherkinServerOptions>>();

  constructor(private connection = createConnection(), private documentManager = new TextDocuments(TextDocument)) {
    this.gherkinSettings = {
      defaultDialect: 'en',
      includeGherkinDocument: true,
      includePickles: true,
      includeSource: false,
    };
    this.connection.onInitialize(this.initialize);
    this.connection.onInitialized(this.intitialized);
    this.connection.onDidChangeConfiguration(this.configurationChanged);
    this.connection.onDocumentFormatting(this.formatDocument);
    this.connection.listen();
    this.documentManager.onDidClose(this.documentClosed);
    this.documentManager.listen(connection);
  }

  initialize(params: InitializeParams): InitializeResult {
    const capabilities = params.capabilities;
    this.hasConfigurationCapability = !!capabilities.workspace?.configuration;
    this.hasWorkspaceFolderCapability = !!capabilities.workspace?.workspaceFolders;
    this.hasDiagnosticRelatedInformationCapability = !!capabilities.textDocument?.publishDiagnostics
      ?.relatedInformation;
    const result: InitializeResult = {
      capabilities: {
        // completionProvider: {
        //   resolveProvider: true,
        // },
        documentFormattingProvider: {
          workDoneProgress: false,
        },
        textDocumentSync: TextDocumentSyncKind.Incremental,
      },
    };
    if (this.hasWorkspaceFolderCapability) {
      result.capabilities.workspace = { workspaceFolders: { supported: true } };
    }
    return result;
  }

  intitialized(): void {
    if (this.hasConfigurationCapability) {
      this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (this.hasWorkspaceFolderCapability) {
      this.connection.client.register(DidChangeWorkspaceFoldersNotification.type, undefined);
    }
  }

  configurationChanged(params: DidChangeConfigurationParams): void {
    if (this.hasConfigurationCapability) {
      this.documentSettings.clear();
    } else {
      this.gherkinSettings = params.settings.gherkin;
    }
  }

  documentClosed(change: TextDocumentChangeEvent<TextDocument>): void {
    this.documentSettings.delete(change.document.uri);
  }

  async formatDocument(params: DocumentFormattingParams): Promise<TextEdit[]> {
    const edits: TextEdit[] = [];
    const featureFile = this.documentManager.get(params.textDocument.uri);
    if (!featureFile) {
      return edits;
    }
    const gherkinDocument = (await this.parseFeatureFile(featureFile)).find((envelope) => envelope.gherkinDocument)
      ?.gherkinDocument;
    if (!gherkinDocument) {
      return edits;
    }
    if (gherkinDocument.feature?.location?.column !== 1) {
      const line = (gherkinDocument.feature?.location?.line || 0) - 1;
      const col = (gherkinDocument.feature?.location?.column || 0) - 1;
      const startPosition = Position.create(line, 0);
      const endPosition = Position.create(line, col);
      const range = Range.create(startPosition, endPosition);
      edits.push(TextEdit.del(range));
    }
    gherkinDocument.feature?.children?.forEach((child) => {
      if (child.background) {
        if (child.background?.location?.column !== params.options.tabSize + 1) {
          const line = (child.background?.location?.line || 0) - 1;
          const character = (child.background?.location?.column || 0) - 1;
          edits.push(this.formatLine(featureFile, line, character, params.options.tabSize, 1));
        }
        child.background.steps?.forEach((step) => {
          if (step.location?.column !== params.options.tabSize * 2 + 1) {
            const stepLine = (step.location?.line || 0) - 1;
            const character = (step.location?.column || 0) - 1;
            edits.push(this.formatLine(featureFile, stepLine, character, params.options.tabSize, 2));
          }
        });
      } else if (child.scenario) {
        if (child.scenario?.location?.column !== params.options.tabSize + 1) {
          const line = (child.scenario?.location?.line || 0) - 1;
          const character = (child.scenario?.location?.column || 0) - 1;
          edits.push(this.formatLine(featureFile, line, character, params.options.tabSize, 1));
        }
        child.scenario.steps?.forEach((step) => {
          if (step.location?.column !== params.options.tabSize * 2 + 1) {
            const stepLine = (step.location?.line || 0) - 1;
            const character = (step.location?.column || 0) - 1;
            edits.push(this.formatLine(featureFile, stepLine, character, params.options.tabSize, 2));
          }
          if (step.docString && step.docString.location?.column !== params.options.tabSize * 3 + 1) {
            const lineNr = (step.docString.location?.line || 0) - 1;
            const character = (step.docString.location?.column || 0) - 1;
            let docStringLines = 2;
            if ((step.docString.content?.length || 0) > 0) {
              docStringLines += step.docString.content?.match(/\n/g)?.length || 0;
            }
            for (let index = 0; index <= docStringLines; index++) {
              edits.push(this.formatLine(featureFile, lineNr + index, character, params.options.tabSize, 3));
            }
          }
        });
      } else if (child.rule) {
        if (child.rule?.location?.column !== params.options.tabSize + 1) {
          const line = (child.rule?.location?.line || 0) - 1;
          const character = (child.rule?.location?.column || 0) - 1;
          edits.push(this.formatLine(featureFile, line, character, params.options.tabSize, 1));
        }
        child.rule.children?.forEach((ruleChild) => {
          if (ruleChild.scenario) {
            if (ruleChild.scenario?.location?.column !== params.options.tabSize * 2 + 1) {
              const line = (ruleChild.scenario?.location?.line || 0) - 1;
              const character = (ruleChild.scenario?.location?.column || 0) - 1;
              edits.push(this.formatLine(featureFile, line, character, params.options.tabSize, 2));
            }
            ruleChild.scenario.steps?.forEach((step) => {
              if (step.location?.column !== params.options.tabSize * 3 + 1) {
                const stepLine = (step.location?.line || 0) - 1;
                const character = (step.location?.column || 0) - 1;
                edits.push(this.formatLine(featureFile, stepLine, character, params.options.tabSize, 3));
              }
              if (step.docString && step.docString.location?.column !== params.options.tabSize * 4 + 1) {
                const lineNr = (step.docString.location?.line || 0) - 1;
                const character = (step.docString.location?.column || 0) - 1;
                let docStringLines = 2;
                if ((step.docString.content?.length || 0) > 0) {
                  docStringLines += step.docString.content?.match(/\n/)?.length || 0;
                }
                for (let index = 0; index <= docStringLines; index++) {
                  edits.push(this.formatLine(featureFile, lineNr + index, character, params.options.tabSize, 4));
                }
              }
            });
          }
        });
      }
    });
    return edits;
  }
  private formatLine(
    featureFile: TextDocument,
    lineNumber: number,
    keywordCol: number,
    tabsize: number,
    indentLevel = 0
  ) {
    const lineStart = Position.create(lineNumber, 0);
    const keywordStart = Position.create(lineNumber, keywordCol);
    const indentation = featureFile.getText(Range.create(lineStart, keywordStart));
    if (!indentation) {
      return TextEdit.insert(lineStart, new Array(tabsize * indentLevel).fill(' ').join(''));
    } else {
      return TextEdit.replace(
        Range.create(lineStart, keywordStart),
        new Array(tabsize * indentLevel).fill(' ').join('')
      );
    }
  }

  private async parseFeatureFile(featureFile: TextDocument): Promise<messages.IEnvelope[]> {
    const options: IGherkinOptions = {
      createReadStream: (path: string) => fs.createReadStream(path, { encoding: 'utf8' }),
      includeGherkinDocument: true,
      includePickles: true,
      includeSource: false,
      ...(await this.getDocumentSettingsAsync(featureFile.uri)),
    };
    const source = makeSourceEnvelope(featureFile.getText(), featureFile.uri);
    const envelopes = await this.streamToArray(GherkinStreams.fromSources([source], options));
    const featureLanguage = envelopes[0].gherkinDocument?.feature?.language;
    if (featureLanguage && featureLanguage !== (await this.documentSettings.get(featureFile.uri))?.defaultDialect) {
      const updatedSettings: GherkinServerOptions = {
        ...(await this.documentSettings.get(featureFile.uri)),
        defaultDialect: featureLanguage,
      };
      this.documentSettings.set(featureFile.uri, Promise.resolve(updatedSettings));
    }
    return envelopes;
  }

  private getDocumentSettingsAsync(featureFileUri: string): Thenable<GherkinServerOptions> {
    if (!this.hasConfigurationCapability) {
      return Promise.resolve(this.gherkinSettings);
    }
    let result = this.documentSettings.get(featureFileUri);
    if (!result) {
      result = this.connection.workspace.getConfiguration({ scopeUri: featureFileUri, section: 'gherkin' });
      this.documentSettings.set(featureFileUri, result);
    }
    return result;
  }

  private async streamToArray(readableStream: Readable): Promise<messages.IEnvelope[]> {
    return new Promise<messages.IEnvelope[]>(
      (resolve: (wrappers: messages.IEnvelope[]) => void, reject: (err: Error) => void) => {
        const items: messages.IEnvelope[] = [];
        readableStream.on('data', items.push.bind(items));
        readableStream.on('error', (err: Error) => reject(err));
        readableStream.on('end', () => resolve(items));
      }
    );
  }
}
