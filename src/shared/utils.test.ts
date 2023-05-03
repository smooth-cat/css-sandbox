import { createHash, isObjectLike, last } from './utils';
jest.unmock('./utils.ts');
describe('createHash', () => {
  it('创建长度为 16 的 hash 值', () => {
    expect(createHash(16).length).toBe(16);
  });
  
  it('创建长度超过随机字符串池数组大小的字符串', () => {
    expect(createHash(100).length).toBe(100);
  });
});

describe('isObjectLike', () => {
  it('判断普通对象', () => {
    expect(isObjectLike({ a: 10 })).toBe(true);
  });

  it('判断普通数组', () => {
    expect(isObjectLike([1, 2, 3])).toBe(true);
  });

  it('特殊对象', () => {
    class A {}
    const a = new A();
    expect(isObjectLike(a)).toBe(true);
    // 目前方法主要针对的是 对象、数组字面量的判断，内置对象通常 JSON.stringify 可以处理
    expect(isObjectLike(new Map())).toBe(false);
  });
});

describe('last', () => {
  it('获取数组最后一项', () => {
    expect(last([1, 2])).toBe(2);
    expect(last([])).toBe(undefined);
  });
});
