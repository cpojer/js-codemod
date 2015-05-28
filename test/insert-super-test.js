'use strict';

class A {}

class B extends A {

  constructor() {
    this.foo = 'bar';
  }

}

class C extends A {

  constructor() {
    this.foo = 'bar';
    super();
  }

}

class D extends A {

  constructor() {
    this.foo = 'bar';
    if (this.foo) {
      super();
    }
  }

}

class E extends A {

  constructor() {
    super();
  }

}

class F extends A {

  constructor() {
    super(() => this.foo);
  }

}

class G extends A {

  constructor() {
    super(this.foo);
  }

}

class H extends A {

  constructor() {
    A.call(this, 'b', 'c');
  }

}

class I extends A {

  constructor() {
    A.apply(this, rest);
  }

}

class J extends A {

  constructor() {
    A.apply(this);
  }

}
