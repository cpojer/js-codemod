if (foo.includes(bar)) {
  // yes
}

if (!foo.includes(bar)) {
  // no
}

if (foo.includes(bar)) {
  // yes
}

if (!foo.includes(bar)) {
  // no
}

if (!abb.foo.includes(bar)) {
  // no
}

if (!foo.includes(bar)) {
  // no
}

if (!foo.includes(bar)) {
  // no
}

if (!foo.includes(bar)) {
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
