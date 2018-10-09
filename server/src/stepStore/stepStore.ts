import * as fs from 'fs';
import { promise as glob } from 'glob-promise';
import { RemoteConsole, TextDocuments } from 'vscode-languageserver';

import gherkin from '../gherkin.json';

export class StepStore {
  public Given: string[] = [];
  public When: string[] = [];
  public Then: string[] = [];

  public featureFiles: string[] = [];

  constructor(private logger: RemoteConsole) { }

  public initialize(
    documents: TextDocuments,
    language: string,
  ): PromiseLike<void> {
    this.Given = [];
    this.When = [];
    this.Then = [];
    this.logger.info(`initializing step store with language ${language}`);
    let pattern = gherkin.repository.keywords.patterns.find(k =>
      k.name.endsWith(language),
    );
    const keywords = pattern
      ? pattern.match
      : gherkin.repository.keywords.patterns.find(k => k.name.endsWith('en'))!
        .match;
    const keywordsArray = keywords.substring(1, keywords.length - 1).split('|');
    pattern = gherkin.repository.steps.patterns.find(p =>
      p.name.endsWith(language),
    );
    const stepsString = pattern
      ? pattern.match
      : gherkin.repository.steps.patterns.find(p => p.name.endsWith(language))!
        .match;
    const stepsArray = stepsString
      .substring(1, stepsString.length - 1)
      .split('|');
    return glob('./**/*.feature')
      .then((featureFiles: string[]) => {
        this.featureFiles = featureFiles;
        featureFiles.forEach(filePath => {
          this.logger.info(`importing steps from ${filePath}`);
          let filecontent: string;
          // files that are opened in VSCode should be read via VSCode, not from disk
          const openedDocument = documents.get(filePath);
          if (openedDocument) {
            filecontent = openedDocument.getText();
          } else {
            filecontent = fs.readFileSync(filePath, 'utf-8');
          }
          let matches = filecontent.match(
            new RegExp(
              //             Background       Scenario
              `^\\s*(?:(${keywordsArray[1]}|${keywordsArray[2]}|${
              //  Scenario Outline
              keywordsArray[3]
              }|${stepsArray.join('|')}))\s?(.*)$`,
              'gm',
            ),
          );
          if (matches) {
            matches = matches.map(s => s.trim()).reverse();
            while (matches.length > 0) {
              const index = matches.findIndex(
                s =>
                  s.startsWith(keywordsArray[1]) ||
                  s.startsWith(keywordsArray[2]) ||
                  s.startsWith(keywordsArray[3]),
              );
              const scenario = matches.splice(0, index + 1);
              let keywordIdx = scenario.findIndex(
                s =>
                  s.startsWith(stepsArray[0]) || // Given
                  s.startsWith(stepsArray[1]) || // When
                  s.startsWith(stepsArray[2]), // Then
              );
              while (keywordIdx > -1) {
                const steps = scenario.splice(0, keywordIdx + 1).reverse();
                switch (steps[0].split(' ', 1)[0]) {
                  case stepsArray[0]: {
                    steps
                      .map(s =>
                        s
                          .split(' ')
                          .slice(1)
                          .join(' '),
                      )
                      .forEach(s => {
                        if (!this.Given.find(g => g === s)) {
                          this.Given.push(s);
                        }
                      });
                    break;
                  }
                  case stepsArray[1]: {
                    steps
                      .map(s =>
                        s
                          .split(' ')
                          .slice(1)
                          .join(' '),
                      )
                      .forEach(s => {
                        if (!this.When.find(w => w === s)) {
                          this.When.push(s);
                        }
                      });
                    break;
                  }
                  case stepsArray[2]: {
                    steps
                      .map(s =>
                        s
                          .split(' ')
                          .slice(1)
                          .join(' '),
                      )
                      .forEach(s => {
                        if (!this.Then.find(t => t === s)) {
                          this.Then.push(s);
                        }
                      });
                    break;
                  }
                  default:
                    break;
                }
                keywordIdx = scenario.findIndex(
                  s =>
                    s.startsWith(stepsArray[0]) ||
                    s.startsWith(stepsArray[1]) ||
                    s.startsWith(stepsArray[2]),
                );
              }
            }
          }
        });
        return;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }
}
