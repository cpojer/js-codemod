let x = {
  a: 1,
  b: 2,
};

({
  ...a,
});

({
  a: 1,
  ...b,
  c: 3,
});

Object.assign(a, b);

Object.assign({}, ...b);
