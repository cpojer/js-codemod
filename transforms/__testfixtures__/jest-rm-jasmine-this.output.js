describe("jest-rm-jasmine-this transform", function() {
  let x, y;
  beforeEach(function() {
    x = 42
    y = x * 2
  });

  it("detects assignments in beforeEach", function() {
    expect(x).toEqual(42);
  })

  it("can use re-assigned variables", function() {
    y = y / 2
    expect(x).toEqual(42);
  })
})
