describe("jest-rm-jasmine-this transform", function() {
  beforeEach(function() {
    this.x = 42
    this.y = this.x * 2
  });

  it("detects assignments in beforeEach", function() {
    expect(this.x).toEqual(42);
  })

  it("can use re-assigned variables", function() {
    this.y = this.y / 2
    expect(this.x).toEqual(42);
  })
})
