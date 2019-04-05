import * as chai from 'chai';
import * as vscode from 'vscode';
import { FormattingOptions } from 'vscode-languageclient';

describe('Formatting', function() {
  let should: Chai.Should;

  this.beforeAll(async function() {
    should = chai.should();
    const extension = vscode.extensions.getExtension('iteratec.bddPowerTools');
    if (extension && extension.isActive) {
      return await extension.activate();
    }
  });

  it('should format the whole document', async function() {
    this.timeout(3000);
    const expectedTextEdits = [
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(1, 0), new vscode.Position(1, 6))), // language
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(2, 0), new vscode.Position(2, 6))), // comment 1
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(3, 0), new vscode.Position(3, 6))), // tag 1
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(4, 0), new vscode.Position(4, 6))), // Feature
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(6, 2), new vscode.Position(6, 6))), // Background
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(7, 4), new vscode.Position(7, 6))), // Given
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(9, 2), new vscode.Position(9, 6))), // tag 2
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(10, 2), new vscode.Position(10, 6))), // comment 2
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(11, 2), new vscode.Position(11, 6))), // Scenario
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(12, 4), new vscode.Position(12, 6))), // When
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(13, 4), new vscode.Position(13, 6))), // Then
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(14, 4), new vscode.Position(14, 6))), // And
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(15, 4), new vscode.Position(15, 6))), // And
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(16, 6), new vscode.Position(16, 8))), // docstring
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(17, 6), new vscode.Position(17, 8))), // docstring
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(18, 6), new vscode.Position(18, 8))), // docstring
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(19, 4), new vscode.Position(19, 6))), // But
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(20, 6), new vscode.Position(20, 8))), // table
      vscode.TextEdit.delete(new vscode.Range(new vscode.Position(21, 6), new vscode.Position(21, 8))), // table
    ];
    const document = `
      # language: en
      # some comment
      @ some tag
      Feature: a unformatted Feature

      Background:
      Given some precondition

      @ another tag
      # another comment
      Scenario: an unformatted scenario
      When I format the whole document
      Then Gherkin keywords are indented
      And the step keywords are indented as well
      And docstrings are indented more
        """
        some docstring
        """
      But table data is indented like docstrings
        | some | table |
        | with | data |
    `;
    const featureFile = await vscode.workspace.openTextDocument({
      content: document,
      language: 'gherkin',
    });
    await vscode.window.showTextDocument(featureFile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const actualTextEdits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider',
      featureFile.uri,
      {
        insertSpaces: true,
        tabSize: 2,
      } as FormattingOptions,
    );
    if (actualTextEdits) {
      return actualTextEdits.should.deep.equal(expectedTextEdits);
    } else {
      throw new Error('No text edits returned.');
    }
  });
});
