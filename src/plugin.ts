export type ScopeOption = {
  scope?: string;
  exclude?: RegExp;
  ignoreFiles?: string;
  transform?: ((scope: string, selector: string, scopedSelector: string) => string|undefined);
  body?: boolean;
  isOld?: boolean;
  idClassOnly?: boolean;
};

const DefaultOpt: ScopeOption = {
  body: false,
}

type ICtx = Record<any, any> & ScopeOption & {
  selector: string;
  group: IGroupItem[];
  handledSelector: string;
}

export type IGroupItem = {
  first: string;
  follow?: string;
  splitter?: string;
}

let ctx = { ...DefaultOpt } as ICtx;
const resetCtx = () => ctx = { ...DefaultOpt } as ICtx;

/**
 * 单个处理选择器
 * @param selector 
 */
const handleEveryFirst = (selector: string) => {
  let {
    scope,
    exclude,
    // ignoreFiles,
    // includeFiles,
    transform,
    body,
    idClassOnly,
  } = ctx;

  // 正则排除
  const shouldExclude = exclude && selector.match(exclude);
  // 默认忽略 body
  const ignoreBody =  !body && selector === 'body';
  // 选择器中 包含 id\class 才
  const notIdClass = idClassOnly && !selector.match(/[\.#]/);

  if (shouldExclude || ignoreBody || notIdClass) {
    return selector;
  }

  const scopedSelector = `${scope}${selector}`;

  // 没有处理直接返回带前缀的
  if(transform == null) return scopedSelector;

  // 处理结果
  const res = transform(scope, selector, scopedSelector);

  // 未返回则不进行替换
  if(res == null) return selector;

  // 返回结果
  return res;
}

// postcss 会对改变后的 ast 重新触发 Rule
const walked = new WeakSet();
/** 不处理的节点 */
const nodeFallback = (node: any) => {
  // 遍历过的节点不再处理
  if(walked.has(node)) return true;
  walked.add(node);

  // 父级是 keyframe 的不做处理
  const keyframeRules = [
    'keyframes',
    '-webkit-keyframes',
    '-moz-keyframes',
    '-o-keyframes',
  ];

  if (node?.parent && keyframeRules.includes(node?.parent?.name)) {
    return true;
  }
  return false;
}

export const createPlugin = (opt: ScopeOption) => {
  return function (root) {
    ctx = { ...ctx, ...DefaultOpt, ...opt };

    root.walkRules((node) => {
      if(nodeFallback(node)) return;
      
      const selectors = [...node.selectors]

      node.selectors = selectors.map((selector: string) => {
        const res = handleEveryFirst(selector);
        return res;
      });
    });

    resetCtx();
  };
};