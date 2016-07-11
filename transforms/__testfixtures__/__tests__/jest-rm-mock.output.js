jest.disableAutomock();

jest.disableAutomock()
  .mock('foo')
  .mock('bar');

jest.disableAutomock()
  .mock('foo');

jest.disableAutomock()
  .mock('bar')
  .mock('foo');

jest
  .mock('foo');

jest
  .mock('foo')
  .mock('bar');

jest
  .mock('bar1')
  .mock('bar')
  .mock('foo');

jest.mock('bar');

jest.unmock('module');
