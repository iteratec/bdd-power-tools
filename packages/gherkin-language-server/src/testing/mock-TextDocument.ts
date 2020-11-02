import { Position, Range, TextDocument } from 'vscode-languageserver-textdocument';

export class MockTextDocument implements TextDocument {
  uri = '';
  languageId = '';
  version = 1;
  getText(range?: Range): string {
    throw new Error('Method not implemented.');
  }
  positionAt(offset: number): Position {
    throw new Error('Method not implemented.');
  }
  offsetAt(position: Position): number {
    throw new Error('Method not implemented.');
  }
  lineCount = 0;
}
