jest.mock('ix').mock('cx');

jest.disableAutomock()
  .mock('cx');

jest.disableAutomock()
  .mock('foo')
  .mock('bar')
  .mock('cx');

jest.disableAutomock()
  .mock('cx')
  .mock('ix')
  .mock('foo');

jest.disableAutomock()
  .mock('ix')
  .mock('bar')
  .mock('foo');

jest
  .mock('ix')
  .mock('cx')
  .mock('foo');

jest
  .mock('ix')
  .mock('foo')
  .mock('bar')
  .mock('cx');

jest
  .mock('ix')
  .mock('bar1')
  .mock('cx')
  .mock('bar')
  .mock('foo');

jest.mock('ix').mock('bar').mock('cx');

jest.mock('ix');

jest.unmock('module');
