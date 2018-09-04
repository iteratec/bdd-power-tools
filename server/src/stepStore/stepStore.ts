import * as fs from 'fs';
import { promise as glob} from 'glob-promise';

export class StepStore {

  public Given: string[] = [];
  public When: string[] = [];
  public Then: string[] = [];

  public featureFiles: string[] = [];

  public initialize(featuresGlob: string): PromiseLike<void> {
    this.Given = [];
    this.When = [];
    this.Then = [];
    return glob(featuresGlob).then((featureFiles: string[]) => {
      this.featureFiles = featureFiles;
      featureFiles.forEach(file => {
        const filecontent = fs.readFileSync(file, 'utf-8');
        let matches = filecontent.match(/^\s*(?:Angenommen) (.*)$/mg);
        if (matches && !this.Given.find(g => g === RegExp.$1)) {
          this.Given.push(RegExp.$1);
        }
        matches = filecontent.match(/^\s*(?:Wenn) (.*)$/mg);
        if (matches && !this.When.find(w => w === RegExp.$1)) {
          this.When.push(RegExp.$1);
        }
        matches = filecontent.match(/^\s*(?:Dann) (.*)$/mg);
        if (matches && !this.Then.find(t => t === RegExp.$1)) {
          this.Then.push(RegExp.$1);
        }
      });
    });
  }
}
