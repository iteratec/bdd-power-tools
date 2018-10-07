import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as vscode from 'vscode';

describe('Autocomplete', function() {
  let should: Chai.Should;

  this.beforeAll(function() {
    this.timeout(20000);
    should = chai.should();
    chai.use(chaiAsPromised);
    if (vscode.extensions.getExtension('iteratec.bdd-power-tools')!.isActive) {
      return Promise.resolve();
    }
    return vscode.extensions
      .getExtension('iteratec.bdd-power-tools')!
      .activate();
  });

  it('should be active', function() {
    vscode.extensions.getExtension('iteratec.bdd-power-tools')!.isActive.should
      .be.true;
  });

  it('should suggest given steps from existing feature files', function() {
    let featureFile: vscode.TextDocument;
    return vscode.workspace
      .openTextDocument({
        content: `
        Feature: a new feature
          Scenario: another scenario
            Given `,
        language: 'gherkin',
      })
      .then(document => {
        featureFile = document;
        return vscode.window.showTextDocument(featureFile);
      })
      .then(editor => {
        const pos = new vscode.Position(2, 19);
        return vscode.commands.executeCommand<vscode.CompletionList>(
          'vscode.executeCompletionItemProvider',
          featureFile.uri,
          pos,
        );
      })
      .then(completionItemList => {
        const list = completionItemList!.items.map(ci => ci.label);
        // tslint:disable-next-line:no-console
        console.log(list);
        list.length.should.equal(2);
        return list.should.deep.equal([
          'there are feature files',
          'the files contain steps',
        ]);
      });
  });

  it('should suggest when steps from existing feature files', function() {
    let featureFile: vscode.TextDocument;
    return vscode.workspace
      .openTextDocument({
        content: `
        Feature: a new feature
          Scenario: another scenario
            When `,
        language: 'gherkin',
      })
      .then(document => {
        featureFile = document;
        return vscode.window.showTextDocument(featureFile);
      })
      .then(editor => {
        const pos = new vscode.Position(2, 19);
        return vscode.commands.executeCommand<vscode.CompletionList>(
          'vscode.executeCompletionItemProvider',
          featureFile.uri,
          pos,
        );
      })
      .then(completionItemList => {
        const list = completionItemList!.items.map(ci => ci.label);
        // tslint:disable-next-line:no-console
        console.log(list);
        list.length.should.equal(2);
        return list.should.deep.equal([
          'I write a new scenario',
          'I add steps',
        ]);
      });
  });

  it('should suggest then steps from existing feature files', function() {
    let featureFile: vscode.TextDocument;
    return vscode.workspace
      .openTextDocument({
        content: `
        Feature: a new feature
          Scenario: another scenario
            Then `,
        language: 'gherkin',
      })
      .then(document => {
        featureFile = document;
        return vscode.window.showTextDocument(featureFile);
      })
      .then(editor => {
        const pos = new vscode.Position(2, 19);
        return vscode.commands.executeCommand<vscode.CompletionList>(
          'vscode.executeCompletionItemProvider',
          featureFile.uri,
          pos,
        );
      })
      .then(completionItemList => {
        const list = completionItemList!.items.map(ci => ci.label);
        // tslint:disable-next-line:no-console
        console.log(list);
        list.length.should.equal(2);
        return list.should.deep.equal([
          'I get suggestions for steps',
          'the suggestions are taken from the files',
        ]);
      });
  });
});
