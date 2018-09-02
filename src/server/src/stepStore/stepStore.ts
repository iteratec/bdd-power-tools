import * as fs from 'fs';
import { promise as glob} from 'glob-promise';

export class StepStore {

  public Given: string[] = [];
  public When: string[] = [];
  public Then: string[] = [];

  constructor(private featuresGlob: string) {}

  public fill(): PromiseLike<void> {
    return glob(this.featuresGlob).then((featureFiles: string[]) => {
      featureFiles.forEach(file => {
        const filecontent = fs.readFileSync(file, 'utf-8');
        let matches = filecontent.match(/^\s*(?:Angenommen) (.*)$/mg);
        if (matches) {
          this.Given.push(RegExp.$1);
        }
        matches = filecontent.match(/^\s*(?:Wenn) (.*)$/mg);
        if (matches) {
          this.When.push(RegExp.$1);
        }
        matches = filecontent.match(/^\s*(?:Dann) (.*)$/mg);
        if (matches) {
          this.Then.push(RegExp.$1);
        }
      });
    });
  }
}
