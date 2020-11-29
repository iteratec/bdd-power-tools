import { IConnection, TextDocuments } from 'vscode-languageserver';
import { DocumentManager } from './document-manager';
import { MockConnection } from '../testing/mock-connection';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { autoSpy } from '../testing/auto-spy';

describe('DocumentManager', () => {
  let connection: IConnection;
  let documentManager: DocumentManager;
  let textDocuments: TextDocuments<TextDocument>;

  beforeEach(() => {
    connection = autoSpy(MockConnection);
    textDocuments = autoSpy<TextDocuments<TextDocument>>(TextDocuments);
    documentManager = new DocumentManager(textDocuments, connection);
  });

  it('should create', () => {
    expect(documentManager).toBeTruthy();
    expect(documentManager.documentClosed$).toBeTruthy();
    expect(documentManager.documentContentChanged$).toBeTruthy();
    expect(documentManager.documentOpened$).toBeTruthy();
  });
});
