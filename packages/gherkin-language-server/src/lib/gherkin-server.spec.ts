import {
  DidChangeConfigurationNotification,
  DidChangeWorkspaceFoldersNotification,
  DocumentFormattingParams,
  IConnection,
  InitializeParams,
  TextDocumentSyncKind,
  TextDocuments,
} from 'vscode-languageserver';
import { SpyOf, autoSpy } from '../testing/auto-spy';
import { TextDocument, TextEdit } from 'vscode-languageserver-textdocument';
import { GherkinServer } from './gherkin-server';
import { MockConnection } from '../testing/mock-connection';
import { MockRemoteClient } from '../testing/mock-remote-client';
import { MockTextDocument } from '../testing/mock-TextDocument';

describe('Gherkin Server', () => {
  let server: GherkinServer;
  let mockedConnection: IConnection;
  let mockedDocManager: SpyOf<TextDocuments<TextDocument>>;

  beforeEach(() => {
    mockedConnection = autoSpy(MockConnection);
    mockedConnection.client = autoSpy(MockRemoteClient);
    mockedDocManager = autoSpy<TextDocuments<TextDocument>>(TextDocuments);
    server = new GherkinServer(mockedConnection, mockedDocManager);
  });

  it('should instantiate and register handlers', () => {
    expect(server).toBeTruthy();
    expect(mockedConnection.onInitialize).toHaveBeenCalledWith(server.initialize);
    expect(mockedConnection.onInitialized).toHaveBeenCalledWith(server.intitialized);
    expect(mockedConnection.onDidChangeConfiguration).toHaveBeenCalledWith(server.configurationChanged);
    expect(mockedConnection.onDocumentFormatting).toHaveBeenCalledWith(server.formatDocument);
    expect(mockedConnection.listen).toHaveBeenCalled();
    expect(mockedDocManager.onDidClose).toHaveBeenCalledWith(server.documentClosed);
    expect(mockedDocManager.listen).toHaveBeenCalledWith(mockedConnection);
  });

  it("should announce it's capabilities when initializing", () => {
    const params: InitializeParams = {
      processId: 42,
      rootUri: '/path/to/root',
      workspaceFolders: [{ name: 'test-workspace', uri: '/path/to/root/test-workspace' }],
      capabilities: {
        textDocument: {
          publishDiagnostics: {
            relatedInformation: true,
          },
        },
        workspace: {
          configuration: true,
          workspaceFolders: true,
        },
      },
    };
    expect(server.initialize(params)).toEqual({
      capabilities: {
        documentFormattingProvider: { workDoneProgress: false },
        textDocumentSync: TextDocumentSyncKind.Incremental,
        workspace: { workspaceFolders: { supported: true } },
      },
    });
  });

  it('should register for notifications only if the client announces the required capabilities', () => {
    const params: InitializeParams = {
      processId: 42,
      rootUri: '/path/to/root',
      workspaceFolders: [{ name: 'test-workspace', uri: '/path/to/root/test-workspace' }],
      capabilities: {},
    };
    server.initialize(params);
    server.intitialized();
    expect(mockedConnection.client.register).not.toHaveBeenCalled();

    params.capabilities = { workspace: { configuration: true } };
    server.initialize(params);
    server.intitialized();
    expect(mockedConnection.client.register).toHaveBeenCalledWith(DidChangeConfigurationNotification.type, undefined);

    params.capabilities = { workspace: { configuration: false } };
    params.capabilities = { workspace: { workspaceFolders: true } };
    server.initialize(params);
    server.intitialized();
    expect(mockedConnection.client.register).toHaveBeenCalledWith(
      DidChangeWorkspaceFoldersNotification.type,
      undefined
    );
  });

  describe('Formatting', () => {
    let mockedDoc: SpyOf<TextDocument>;
    let params: DocumentFormattingParams;

    beforeEach(() => {
      mockedDoc = autoSpy(MockTextDocument);
      params = {
        options: {
          insertSpaces: true,
          tabSize: 2,
          insertFinalNewline: true,
          trimFinalNewlines: true,
          trimTrailingWhitespace: true,
        },
        textDocument: { uri: '' },
      };
    });

    it('should remove indentation from a Feature line', async () => {
      mockedDoc.getText.mockReturnValueOnce('  Feature: minimalistic\n  Scenario: minimal\n    Then nothing\n');
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected: TextEdit[] = [
        {
          newText: '',
          range: { start: { character: 0, line: 0 }, end: { character: 2, line: 0 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set correct indentation on a Background: line', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          'Background: not indented\n' +
          '    Given nothing\n\n' +
          '  Scenario: something\n' +
          '    Then nothing'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      let expected: TextEdit[] = [
        {
          newText: '  ',
          range: { start: { character: 0, line: 1 }, end: { character: 0, line: 1 } },
        },
      ];
      let edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '    Background: too much indentation\n' +
          '    Given nothing\n\n' +
          '  Scenario: something\n' +
          '    Then nothing'
      );
      expected = [
        {
          newText: '  ',
          range: { start: { character: 0, line: 1 }, end: { character: 4, line: 1 } },
        },
      ];
      edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set correct indentation on Background Step lines', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Background: minimal\n' +
          '  Given too little indentation\n' +
          '      And too much indentation\n\n' +
          '  Scenario: something\n' +
          '    Then nothing\n'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '    ',
          range: { start: { character: 0, line: 2 }, end: { character: 2, line: 2 } },
        },
        {
          newText: '    ',
          range: { start: { character: 0, line: 3 }, end: { character: 6, line: 3 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it.todo('should set recommended indentation for a Doc String in a Step of a Background');

    it('should set correct indentation on a Scenario: line', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          'Scenario: no indentation\n' +
          '    Then nothing\n\n' +
          '    Scenario: too much indentation\n' +
          '    Then nothing\n\n' +
          '  Scenario: correctly indented\n' +
          '    Then nothing'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '  ',
          range: { start: { character: 0, line: 1 }, end: { character: 0, line: 1 } },
        },
        {
          newText: '  ',
          range: { start: { character: 0, line: 4 }, end: { character: 4, line: 4 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set correct indentation on a Scenario Step line', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Scenario: minimal\n' +
          '  Given too little indentation\n' +
          '      When too much indentation\n' +
          '    Then nothing\n'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '    ',
          range: { start: { character: 0, line: 2 }, end: { character: 2, line: 2 } },
        },
        {
          newText: '    ',
          range: { start: { character: 0, line: 3 }, end: { character: 6, line: 3 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set recommended indentation for Doc Strings in a step of a regular scenario', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Scenario: minimal\n' +
          '    Given a Doc String\n' +
          '"""\n' +
          'no\n' +
          'indentation\n' +
          '"""\n' +
          '    When another Doc String\n' +
          '        """\n' +
          '        too much indentation\n' +
          '        """\n' +
          '    Then a third Doc String\n' +
          '      """\n' +
          '      correct indentation\n' +
          '      """'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '      ',
          range: { start: { character: 0, line: 3 }, end: { character: 0, line: 3 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 4 }, end: { character: 0, line: 4 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 5 }, end: { character: 0, line: 5 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 6 }, end: { character: 0, line: 6 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 8 }, end: { character: 8, line: 8 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 9 }, end: { character: 8, line: 9 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 10 }, end: { character: 8, line: 10 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set correct indentation on a Rule: line', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          'Rule: no indentation\n' +
          '    Example: minimal\n' +
          '      Then nothing\n\n' +
          '    Rule: too nuch indentation\n' +
          '    Example: minimal\n' +
          '      Then nothing\n\n' +
          '  Rule: correctly indented\n' +
          '    Example: minimal\n' +
          '      Then nothing'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '  ',
          range: { start: { character: 0, line: 1 }, end: { character: 0, line: 1 } },
        },
        {
          newText: '  ',
          range: { start: { character: 0, line: 5 }, end: { character: 4, line: 5 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set correct indentation on a Example: line nested in a Rule:', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Rule: minimal\n' +
          'Example: no indentation\n' +
          '      Then nothing\n\n' +
          '      Example: too nuch indentation\n' +
          '      Then nothing\n\n' +
          '    Example: correctly indented\n' +
          '      Then nothing'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '    ',
          range: { start: { character: 0, line: 2 }, end: { character: 0, line: 2 } },
        },
        {
          newText: '    ',
          range: { start: { character: 0, line: 5 }, end: { character: 6, line: 5 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('Should set correct indentation on Step lines in an Example of a Rule', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Rule: minimal\n' +
          '    Example: minimal\n' +
          'Given no indentation\n' +
          '  When incorrect indentation\n' +
          '      Then correct indentation\n'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '      ',
          range: { start: { character: 0, line: 3 }, end: { character: 0, line: 3 } },
        },
        {
          newText: '      ',
          range: { start: { character: 0, line: 4 }, end: { character: 2, line: 4 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it('should set recommended indentation for Doc Strings in a Step of an Example of a Rule', async () => {
      mockedDoc.getText.mockReturnValue(
        'Feature: minimalistic\n' +
          '  Rule: minimal\n' +
          '    Example:\n' +
          '      Given a Doc String\n' +
          '"""\n' +
          'no\n' +
          'indentation\n' +
          '"""\n' +
          '      When another Doc String\n' +
          '          """\n' +
          '          too much indentation\n' +
          '          """\n' +
          '      Then a third Doc String\n' +
          '        """\n' +
          '        correct indentation\n' +
          '        """'
      );
      mockedDocManager.get.mockReturnValue(mockedDoc);
      const expected = [
        {
          newText: '        ',
          range: { start: { character: 0, line: 4 }, end: { character: 0, line: 4 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 5 }, end: { character: 0, line: 5 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 6 }, end: { character: 0, line: 6 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 7 }, end: { character: 0, line: 7 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 9 }, end: { character: 10, line: 9 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 10 }, end: { character: 10, line: 10 } },
        },
        {
          newText: '        ',
          range: { start: { character: 0, line: 11 }, end: { character: 10, line: 11 } },
        },
      ];
      const edits = await server.formatDocument(params);
      expect(edits).toEqual(expected);
    });

    it.todo("should not change the indentation of the Doc String's content");
    it.todo('should set correct indentation for data tables');
    it.todo('should adjust column width in data tables to match the widest cell in the column');
  });
});
