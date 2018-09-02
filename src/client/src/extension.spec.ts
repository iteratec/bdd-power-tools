import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

describe('VSCode-Gherkin', function() {

  before(function() {
    use(chaiAsPromised);
  });

  it('should pass', function() {
    expect(true).to.be.true;
  });

});
