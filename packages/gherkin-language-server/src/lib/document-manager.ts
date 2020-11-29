import { IConnection, TextDocumentChangeEvent, TextDocuments } from 'vscode-languageserver';
import { Observable, fromEventPattern } from 'rxjs';
import { GherkinServerOptions } from './gherkin-server-options';
import { TextDocument } from 'vscode-languageserver-textdocument';

export class DocumentManager {
  private readonly documentSettings = new Map<string, Thenable<GherkinServerOptions>>();

  documentOpened$: Observable<TextDocumentChangeEvent<TextDocument>>;
  documentContentChanged$: Observable<TextDocumentChangeEvent<TextDocument>>;
  documentClosed$: Observable<TextDocumentChangeEvent<TextDocument>>;

  constructor(textDocuments: TextDocuments<TextDocument>, connection: IConnection) {
    this.documentOpened$ = fromEventPattern(textDocuments.onDidOpen);
    this.documentContentChanged$ = fromEventPattern(textDocuments.onDidChangeContent);
    this.documentClosed$ = fromEventPattern(textDocuments.onDidClose);
    textDocuments.listen(connection);
  }
}
