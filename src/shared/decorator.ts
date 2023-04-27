import { createHash } from './utils';

// 收集重写 对象 -> 方法名 -> 字段索引 -> fn
const OverrideCollection = new Map<any, Map<any, Function[][]>>();

const getByDefault = <T>(target: any, key: any, def: T) => {
  const res = target.get(key);
  if (res) {
    return res as T;
  }
  target.set(key, def);
  return def;
};

export const createRewriteParamFn = (...fns: ((target: any) => any)[]) =>
  ((target: Object, key: string | symbol, i: number) => {
    const keyMap = getByDefault(OverrideCollection, target, new Map<any, Function[]>());
    const fnSet = getByDefault(keyMap, key, new Array<Function[]>());
    const colI = fnSet[i];
    // 由于参数装饰器是 从右到左执行的，因此后来的装饰器应该推到执行函数队列头
    colI ? colI.unshift(...fns) : (fnSet[i] = fns);
  }) as ParameterDecorator;

/** 配合重写函数参数 */
export const Ovr = (decorateUndefined = true) =>
  ((target, key, descriptor: TypedPropertyDescriptor<any>) => {
    const rawFn = target[key];
    descriptor.value = function (...args: any[]) {
      const argsLen = decorateUndefined ? rawFn.length : args.length;
      // 重写每个属性
      for (let i = 0; i < argsLen; i++) {
        const fns = OverrideCollection?.get(target)?.get(key)?.[i];
        if (fns) {
          args[i] = fns.reduce((pRes, f) => f(pRes), args[i]);
        }
      }
      // 清除 map 中转
      OverrideCollection.delete(target);
      return rawFn.call(this, ...args);
    };
  }) as MethodDecorator;

/*----------------- prefix 函数的 opt 修正 -----------------*/
export type IOption = {
  /** 使用 prefix 方法需要使用的前缀选择器 */
  prefix?: string;
  /** 需要排除的选择器 */
  exclude?: RegExp;
  /** 仅使用 cli 和 CssSandbox 工具类时需要忽略的文件 glob 语法 */
  ignoreFiles?: string;
  /** 自定义每个选择器的处理函数 */
  transform?: (prefix: string, selector: string, prefixedSelector: string) => string | undefined;
  /** 是否作用于 body */
  body?: boolean;
  /** 是否输出调试日志 [css-sandbox-debug] */
  debug?: boolean;
  /** 是否只处理包含 id 和 class 的选择器 */
  idClassOnly?: boolean;
  /** TODO: 简单替换 document.createElement */
  simpleReplaceCreateElement?: boolean;
};

export const _handleOpt = (opt: IOption = {}) => {
  return {
    body: false,
    debug: false,
    idClassOnly: false,
    // TODO: 复杂的 window.document 追踪（暂不实现）大部分打包工具不会做 window 的重写来压缩体积
    simpleReplaceCreateElement: true,
    ...opt
  };
};

/** prefix 函数的 opt */
export const Opt = createRewriteParamFn(_handleOpt);
/*----------------- prefix 函数的 opt 修正 -----------------*/

/*----------------- cssSandbox 函数的 opt 修正 -----------------*/
export type ICssSandBoxOption = IOption & {
  /** cssSandbox 特殊属性 */
  scope?: string;
  /** cssSandbox 特殊属性 */
  hash?: number;
};

/** 兼容 scopeAttr 属性 并把 hash 值附带上 */
export const _handleSandboxOpt = (opt: ICssSandBoxOption = {}) => {
  let { hash: len = 8, scope = '', prefix = '' } = opt;
  // prefix 存在 且 scope 不存在才使用 prefix，其他情况以 scope 为准
  if (!scope && prefix) {
    return { ...opt };
  }

  // scope 默认值为 sandbox
  const raw = scope || 'css-sandbox';

  scope = `${raw}_${createHash(len)}`;

  prefix = `[${scope}]`;

  return { ...opt, prefix, scope };
};

/** cssSandbox 函数的 opt */
export const SandboxOpt = createRewriteParamFn(_handleSandboxOpt);
/*----------------- cssSandbox 函数的 opt 修正 -----------------*/

/*----------------- 单独处理的js/css 函数的 opt 修正, 如 babelPlugin、postCssPlugin -----------------*/
const _handleDropHashOpt = (opt: ICssSandBoxOption = {}) => {
  if (!opt.scope) return opt;
  const scope = opt.scope.split('_')[0];
  const prefix = `[${scope}]`;
  return { ...opt, scope, prefix };
};
export const DropHashOpt = createRewriteParamFn(_handleDropHashOpt);
/*----------------- 单独处理的js/css 函数的 opt 修正, 如 babelPlugin、postCssPlugin -----------------*/

/*----------------- stylisCssSandbox 函数的 opt 修正 -----------------*/
const __temp_obj = {
  // 这里最终会被替换成编译时的 sandbox 类名
  ____sandboxHash_____: () => ''
};
// 确保对象被留下，不会被打包优化
// console.log(JSON.stringify(__temp_obj));

export type IStylisCssSandBoxOption = Omit<IOption, 'prefix'>;

export const _handleStylisSandboxOpt = (opt: IStylisCssSandBoxOption = {}) => {
  const prefix = __temp_obj.____sandboxHash_____();
  return { ...opt, prefix };
};

/** stylisCssSandbox 函数的 opt */
export const StylisSandboxOpt = createRewriteParamFn(_handleStylisSandboxOpt);
/*----------------- stylisCssSandbox 函数的 opt 修正 -----------------*/
