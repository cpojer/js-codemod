jest.unmock('foo').unmock('bar');

jest
  .unmock('foo')
  .unmock('bar')
  .unmock('bar');

jest.unmock('foo').mock('bar').unmock('bar');

jest.disableAutomock();
jest.enableAutomock();

jest.fn();
jest.fn();

jest.fn(() => { test; });
jest.fn((banana) => banana);
jest.fn(function() { test(); });

jest.fn().mockReturnValueOnce(123);
