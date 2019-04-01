import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as vscode from 'vscode';

describe('Autocomplete', function() {
  let should: Chai.Should;

  this.beforeAll(async function() {
    should = chai.should();
    chai.use(chaiAsPromised);
    if (!vscode.extensions.getExtension('iteratec.bdd-power-tools')!.isActive) {
      return await vscode.extensions.getExtension('iteratec.bdd-power-tools')!.activate();
    }
  });

  it('should be active', function() {
    vscode.extensions.getExtension('iteratec.bdd-power-tools')!.isActive.should.be.true;
  });

  it('should suggest given steps from existing feature files', async function() {
    this.timeout(5000);
    const expectedCompletionList = [
      { label: 'a root precondition', kind: vscode.CompletionItemKind.Constant },
      { label: 'a second root precondition', kind: vscode.CompletionItemKind.Constant },
      { label: 'another root precondition', kind: vscode.CompletionItemKind.Constant },
      { label: 'not the third root precondition', kind: vscode.CompletionItemKind.Constant },
    ];
    const featureFile = await vscode.workspace.openTextDocument({
      content: `
        Feature: a new feature
          Scenario: a new scenario
            Given `,
      language: 'gherkin',
    });
    await vscode.window.showTextDocument(featureFile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pos = new vscode.Position(3, 25);
    const actualCompletionList = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      featureFile.uri,
      pos,
    );
    if (actualCompletionList) {
      const actualItems = actualCompletionList.items.map(item => {
        return { label: item.label, kind: item.kind };
      });
      return actualItems.should.deep.equal(expectedCompletionList);
    } else {
      throw new Error('No completion list');
    }
  });

  it('should suggest when steps from existing feature files', async function() {
    this.timeout(5000);
    const expectedCompletionList = [
      { label: 'a root action', kind: vscode.CompletionItemKind.Constant },
      { label: 'a simple root action', kind: vscode.CompletionItemKind.Constant },
      { label: 'another root action', kind: vscode.CompletionItemKind.Constant },
      { label: 'not the third root action', kind: vscode.CompletionItemKind.Constant },
    ];
    const featureFile = await vscode.workspace.openTextDocument({
      content: `
        Feature: a new feature
          Scenario: another scenario
            When `,
      language: 'gherkin',
    });
    await vscode.window.showTextDocument(featureFile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pos = new vscode.Position(3, 23);
    const actualCompletionList = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      featureFile.uri,
      pos,
    );
    if (actualCompletionList) {
      const actualItems = actualCompletionList.items.map(item => {
        return { label: item.label, kind: item.kind };
      });
      return actualItems.should.deep.equal(expectedCompletionList);
    } else {
      throw new Error('No completion list');
    }
  });

  it('should suggest then steps from existing feature files', async function() {
    this.timeout(5000);
    const expectedCompletionList = [
      { label: 'a root result', kind: vscode.CompletionItemKind.Constant },
      { label: 'a simple root result', kind: vscode.CompletionItemKind.Constant },
      { label: 'another root result', kind: vscode.CompletionItemKind.Constant },
      { label: 'not the third root result', kind: vscode.CompletionItemKind.Constant },
    ];
    const featureFile = await vscode.workspace.openTextDocument({
      content: `
        Feature: a new feature
          Scenario: another scenario
            Then `,
      language: 'gherkin',
    });
    await vscode.window.showTextDocument(featureFile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pos = new vscode.Position(3, 23);
    const actualCompletionList = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      featureFile.uri,
      pos,
    );
    if (actualCompletionList) {
      const actualCompletionItems = actualCompletionList!.items.map(item => {
        return { label: item.label, kind: item.kind };
      });
      return actualCompletionItems.should.deep.equal(expectedCompletionList);
    } else {
      throw new Error('No completion list');
    }
  });
});
