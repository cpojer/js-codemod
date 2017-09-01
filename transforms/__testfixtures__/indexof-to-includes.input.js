if (foo.indexOf(bar) >= 0) {
  // yes
}

if (!foo.indexOf(bar) >= 0) {
  // no
}

if (foo.indexOf(bar) > -1) {
  // yes
}

if (foo.indexOf(bar) <= -1) {
  // no
}

if (abb.foo.indexOf(bar) <= -1) {
  // no
}

if (foo.indexOf(bar) < 0) {
  // no
}

if (foo.indexOf(bar) === -1) {
  // no
}

if (foo.indexOf(bar) == -1) {
  // no
}

if (foo.indexOf(bar) === 0) {
  // no change
}

if (foo.indexOf(bar) === 1) {
  // no change
}

if (foo.indexOf(bar) === 2) {
  // no change
}

if (foo.indexOf(bar) == 0) {
  // no change
}

if (foo.indexOf(bar) == 1) {
  // no change
}

if (foo.indexOf(bar) == 2) {
  // no change
}

if (!bar.includes(foo)) {
  // no change
}
