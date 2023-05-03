import { LimitMap } from './limit-map';
describe('LimitMap', () => {
  
  it('正常收集', () => {
    const map = new LimitMap();
    map.set('a', 0);
    expect(map.get('a')).toBe(0);
  })

  it('0 引用 key 标记收集', () => {
    const map = new LimitMap();
    map.set('a', '0');
    expect(map.zeroSet.size).toBe(1);
    expect(map.zeroOne()).toBe('a');
    expect(map.get('a')).toBe('0');
    expect(map.zeroSet.size).toBe(0);
    expect(map.zeroOne()).toBe(undefined);
  })

  it('到达 0 引用最大上限则删除较前收集的 0引用 key', () => {
    const map = new LimitMap(3);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    map.set('d', 4);
    expect(map.get('a')).toBe(undefined);
  })

  it('到达 0 引用最大上限则删除较前收集的 0引用 key(例子2)', () => {
    const map = new LimitMap(3);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    // 获取a后，b作为第一个收集的 0 引用 key，当收集 e 时达到上限，b就被释放了
    map.get('a');
    map.set('d', 4);
    map.set('e', 5);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(undefined);
  })
})