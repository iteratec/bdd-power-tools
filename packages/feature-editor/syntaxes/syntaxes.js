const fs = require('fs');
const path = require('path');
const gherkin = require('@cucumber/gherkin/src/gherkin-languages.json');
const syntaxes = require('./gherkin.tmLanguage.json');

function updateSyntax() {
  syntaxes.repository.keywords.patterns = [];
  syntaxes.repository.steps.patterns = [];
  Object.keys(gherkin).forEach((languageKey) => {
    const language = gherkin[languageKey];
    const keyWordPattern = {
      name: `keyword.control.gherkin.${languageKey}`,
      match: `(${language.feature
        .concat(language.background)
        .concat(language.scenario)
        .concat(language.scenarioOutline)
        .concat(language.examples)
        .map((keyword) => `${keyword}:`)
        .join('|')})`,
    };
    const stepsPattern = {
      name: `keyword.other.gherkin.${languageKey}`,
      match: `(${language.given
        .concat(language.when)
        .concat(language.then)
        .concat(language.and)
        .concat(language.but)
        .filter((step) => step !== '* ')
        .join('|')})`,
    };
    syntaxes.repository.keywords.patterns.push(keyWordPattern);
    syntaxes.repository.steps.patterns.push(stepsPattern);
  });
  const targetpath = path.join(__dirname, '..', '..', '..', 'dist', 'bdd-power-tools', 'syntaxes');
  if (!fs.existsSync(targetpath)) {
    fs.mkdirSync(targetpath);
  }
  fs.writeFileSync(path.join(targetpath, 'gherkin.tmLanguage.json'), JSON.stringify(syntaxes, null, 2));
}

updateSyntax();
