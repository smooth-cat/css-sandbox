import { stringify } from './stringify';
describe('stringify', () => {
  const a = {
    value: 'aaa'
  };

  const c = {
    value: {
      x: 0,
      y: 1
    },
    a
  };

  // @ts-ignore
  a.c = c;

  const e = {
    a,
    c
  };

  it('字符串化后的结果', () => {
    expect(stringify(e)).toMatchInlineSnapshot(`
"{
  "a": {
    "value": "aaa",
    "c": {
      "value": {
        "x": 0,
        "y": 1
      },
      "a": "root.a"
    }
  },
  "c": "root.a.c"
}"
`);
  });
});
