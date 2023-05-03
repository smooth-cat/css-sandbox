import {
  getByDefault,
  OverrideCollection,
  createRewriteParamFn,
  Ovr,
  _handleOpt,
  _handleSandboxOpt,
  _handleDropHashOpt,
  _handleStylisSandboxOpt
} from './decorator';
import { DefaultScope, MockHash } from '../../jest-config/utils';
describe('getByDefault', () => {
  let map: Map<any, any>;
  function initMap() {
    map = new Map([['a', '10']]);
  }
  initMap();
  afterEach(() => initMap());

  it('取得到值', () => {
    const res = getByDefault(map, 'a', '20');
    expect(res).toBe('10');
  });

  it('取不到值', () => {
    const res = getByDefault(map, 'b', '20');
    expect(res).toBe('20');
  });
});

const createDecFn = (value: any) => {
  const fn = jest.fn();
  fn.mockImplementation(() => value);
  return fn;
};

describe('createRewriteParamFn', () => {
  let obj: Object = {};
  afterEach(() => {
    OverrideCollection.clear();
    obj = {};
  });

  it('测试添加一个参数装饰器', () => {
    const spier = createDecFn(1);
    const collect = createRewriteParamFn(spier);
    collect(obj, 'a', 0);
    const fn = OverrideCollection.get(obj)?.get('a')?.[0]?.[0];
    expect(typeof fn).toBe('function');
    expect(fn?.()).toBe(1);
  });

  it('给同一参数添加多个参数装饰器 -- createRewriteParamFn 多入参方式', () => {
    const spier1 = createDecFn(1);
    const spier2 = createDecFn(2);
    const collect = createRewriteParamFn(spier1, spier2);
    collect(obj, 'a', 0);
    const fns = OverrideCollection.get(obj)?.get('a')?.[0];
    expect(fns).toEqual([spier1, spier2]);
  });

  it('给同一参数添加多个参数装饰器 -- 多次 createRewriteParamFn 方式', () => {
    const spier1 = createDecFn(1);
    const spier2 = createDecFn(2);
    const collect1 = createRewriteParamFn(spier1);
    const collect2 = createRewriteParamFn(spier2);
    // 模拟参数装饰器 @collect1 @collect2 从后往前执行
    collect2(obj, 'a', 0);
    collect1(obj, 'a', 0);
    const fns = OverrideCollection.get(obj)?.get('a')?.[0];
    expect(fns).toEqual([spier1, spier2]);
  });
});

describe('Ovr', () => {
  let obj = {
    a(v?: any) {
      return v;
    }
  };
  afterEach(() => {
    OverrideCollection.clear();
    obj = {
      a(v?: any) {
        return v;
      }
    };
  });

  it('重写函数参数', () => {
    const fn = createDecFn(1);

    OverrideCollection.set(obj, new Map([['a', [[fn]]]]));

    const descriptor = Ovr()(obj, 'a', Object.getOwnPropertyDescriptor(obj, 'a')!);

    Object.defineProperty(obj, 'a', descriptor as any);

    expect(obj.a(2)).toBe(1);
    expect(fn).toBeCalled();
    expect(OverrideCollection.get(obj)).toBe(undefined);
  });

  it('重写未定义参数', () => {
    const fn = createDecFn(1);

    OverrideCollection.set(obj, new Map([['a', [[fn]]]]));

    const descriptor = Ovr()(obj, 'a', Object.getOwnPropertyDescriptor(obj, 'a')!);

    Object.defineProperty(obj, 'a', descriptor as any);

    expect(obj.a()).toBe(1);
    expect(fn).toBeCalled();
  });

  it('不重写未定义参数', () => {
    const fn = createDecFn(1);

    OverrideCollection.set(obj, new Map([['a', [[fn]]]]));

    const descriptor = Ovr(false)(obj, 'a', Object.getOwnPropertyDescriptor(obj, 'a')!);

    Object.defineProperty(obj, 'a', descriptor as any);

    expect(obj.a()).toBe(undefined);
    expect(fn).toBeCalledTimes(0);
  });

  it('链式调用装饰器', () => {
    const fn1 = createDecFn(1);
    const fn2 = createDecFn(2);

    OverrideCollection.set(obj, new Map([['a', [[fn1, fn2]]]]));

    const descriptor = Ovr()(obj, 'a', Object.getOwnPropertyDescriptor(obj, 'a')!);

    Object.defineProperty(obj, 'a', descriptor as any);

    expect(obj.a(0)).toBe(2);
    expect(fn1).toBeCalled();
    expect(fn2).toBeCalled();
  });

  it('es6 类测试', () => {
    const spier = createDecFn(1);
    const One = createRewriteParamFn(spier);

    class Foo {
      @Ovr()
      static bar(@One value: number) {
        return value;
      }
    }

    expect(Foo.bar(0)).toBe(1);
    expect(spier).toBeCalled();
  });
});

describe('_handleOpt', () => {
  it('重写props', () => {
    const res = _handleOpt({ debug: true });
    expect(res.debug).toBe(true);
  });
});

describe('_handleSandboxOpt 重写 sandbox 类型入参 props', () => {
  it('使用默认 scope', () => {
    const res = _handleSandboxOpt();
    expect(res.scope).toBe(`${DefaultScope}_${MockHash}`);
    expect(res.prefix).toBe(`[${DefaultScope}_${MockHash}]`);
  });

  it('使用 scope', () => {
    const scope = 'my-sandbox';
    const res = _handleSandboxOpt({ scope });
    expect(res.scope).toBe(`${scope}_${MockHash}`);
    expect(res.prefix).toBe(`[${scope}_${MockHash}]`);
  });

  it('使用 prefix', () => {
    const prefix = '.my-prefix ';
    const res = _handleSandboxOpt({ prefix });
    expect(res.scope).toBe(undefined);
    expect(res.prefix).toBe(prefix);
  });

  it('使用 prefix 同时使用 scope', () => {
    const scope = 'my-sandbox';
    const prefix = '.my-prefix ';
    const res = _handleSandboxOpt({ scope, prefix });
    expect(res.scope).toBe(`${scope}_${MockHash}`);
    expect(res.prefix).toBe(`[${scope}_${MockHash}]`);
  });
});

describe('_handleDropHashOpt 剔除 _handleSandboxOpt 增加的 hash 值', () => {
  it('剔除 hash 值', () => {
    const rawScope = 'my_sandbox';
    const handledScope = `${rawScope}_12345678`;
    const res = _handleDropHashOpt({ scope: handledScope });
    expect(res['scope']).toBe(rawScope);
    expect(res['prefix']).toBe(`[${rawScope}]`);
  });

  it('无 scope 不处理', () => {
    const res = _handleDropHashOpt({});
    expect(res).toEqual({});
  });
});

describe('_handleStylisSandboxOpt', () => {
  it('获取 stylis 插件 prefix，默认值是 css-sandbox，但真实执行时会在编译时被 handleJsFile 替换值', () => {
    const res = _handleStylisSandboxOpt();
    expect(res.prefix).toBe(`[${DefaultScope}]`);
  });
});
