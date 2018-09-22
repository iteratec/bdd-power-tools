import * as fs from 'fs';
import { promise as glob} from 'glob-promise';

export class StepStore {

  public Given: string[] = [];
  public When: string[] = [];
  public Then: string[] = [];

  public featureFiles: string[] = [];

  public initialize(): PromiseLike<void> {
    this.Given = [];
    this.When = [];
    this.Then = [];
    return glob('./**/*.feature').then((featureFiles: string[]) => {
      this.featureFiles = featureFiles;
      featureFiles.forEach(file => {
        const filecontent = fs.readFileSync(file, 'utf-8');
        let matches = filecontent.match(/^\s*(?:(Szenario:|Angenommen|Wenn|Dann|Und|Aber)) (.*)$/gm);
        if (matches) {
          matches = matches.map(s => s.trim()).reverse();
          while (matches.length > 0) {
            const index = matches.findIndex(s => s.startsWith('Szenario:'));
            const scenario = matches.splice(0, index + 1);
            let keywordIdx = scenario.findIndex(s => s.startsWith('Angenommen') ||
                                                    s.startsWith('Wenn') ||
                                                    s.startsWith('Dann'));
            while (keywordIdx > -1) {
              const steps = scenario.splice(0, keywordIdx + 1).reverse();
              switch (steps[0].split(' ', 1)[0]) {
                case 'Angenommen': {
                  steps.map(s => s.split(' ').slice(1).join(' ')).forEach(s => {
                    if (!this.Given.find(g => g === s)) {
                      this.Given.push(s);
                    }
                  });
                  break;
                }
                case 'Wenn': {
                  steps.map(s => s.split(' ').slice(1).join(' ')).forEach(s => {
                    if (!this.When.find(w => w === s)) {
                      this.When.push(s);
                    }
                  });
                  break;
                }
                case 'Dann': {
                  steps.map(s => s.split(' ').slice(1).join(' ')).forEach(s => {
                    if (!this.Then.find(t => t === s)) {
                      this.Then.push(s);
                    }
                  });
                  break;
                }
                default:
                  break;
              }
              keywordIdx = scenario.findIndex(s => s.startsWith('Angenommen') ||
                                                  s.startsWith('Wenn') ||
                                                  s.startsWith('Dann'));
            }
          }
        }
      });
    })
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.error(error);
    });
  }
}
