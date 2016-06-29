jest.dontMock('foo').dontMock('bar');

jest
  .dontMock('foo')
  .dontMock('bar')
  .dontMock('bar');

jest.dontMock('foo').mock('bar').dontMock('bar');

jest.autoMockOff();
jest.autoMockOn();

jest.genMockFunction();
jest.genMockFn();

jest.genMockFunction().mockImpl(() => { test; });
jest.genMockFunction().mockImplementation((banana) => banana);
jest.genMockFn().mockImpl(function() { test(); });

jest.genMockFn().mockReturnValueOnce(123);
