# BDD Power Tools

A mono repo using [yarn](https://classic.yarnpkg.com/lang/en/) workspaces for the BDD Power Tools extension(s).

## Layout

The monorepo consists of the following packages:

-   bdd-power-tools (aka BDD Feature Editor)

    the language client of the extension

-   gherkin-language-server

    the gherkin language server as a separate npm package

## Contributing

The monorepo follows semantic versioning conventions.
Version numbers are calculated by [lerna](https://github.com/lerna/lerna) based on commit messages.
[commitlint](https://commitlint.js.org/#/) is used to validate commit messages, ensuring they follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) conventions.

> Commits ignoring these conventions will be ignored by _lerna_, and thus not trigger a new release!

In addition the following tools are used to ensure code style, formatting and unit tests.
Make sure you have the appropriate extensions installed for your editor.
Extension recommendations for VS Code and workspace settings for those are part of the mono repo.

### Linting

Coding style is enforced by [eslint](https://eslint.org/) with the [Typescript plugin](https://github.com/typescript-eslint/typescript-eslint/).

### Formatting

Code formatting is done by [Prettier](https://prettier.io/).

### Testing

Unit tests are written using [Jest](https://jestjs.io/en).

### Releasing

As mentioned above _semantic-release_ is used to determine if a commit should result in a new release of the package and calculates the next version number.
Releases are only created on the CI environment at [Azure Devops](https://dev.azure.com/bdd-power-tools/bddpowertools).
