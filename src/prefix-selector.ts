import { createPlugin, ScopeOption } from './plugin';
import postcss from 'postcss';
import { createHash, globP, loopFiles } from './utils';

export type IWriteSingle = (css: string, opt: CssSandboxOption) => string;

export const CreateElementStatement = 'document.createElement';

export const SandboxHashPropStatement = '\\w+.____sandboxHash\\(\\)'
export const ReplaceFnStatement = 'documentDCreateElement';
export const rewrittenFn = (attr: string) => `\nfunction ${ReplaceFnStatement}(...args){var el=document.createElement(...args);el.setAttribute('${attr}');return el;}`;

export const sandboxHash = (attr: string) => `\nfunction ____sandboxHash(){return '${attr}';}`;

/**
 * 调用 postCss 和 postcss-prefix-selector 处理 css 字符串
 */
export const prefixSelectorSingle: IWriteSingle = (css, opt = {}) => {
  const plugin = createPlugin(opt) as any;
  const out = postcss([plugin]).process(css).css;
  return out;
};

export const rewriteCreateElement: IWriteSingle = (js, opt = {}) => {
  const { scopeAttr, stylisCssSandboxPlugin } = opt;
  

  const regStr = `(${CreateElementStatement})|(${SandboxHashPropStatement})`;

  let handled = js.replace(new RegExp(regStr, 'g'), (match, left, right) => {
    if(left) {
      return ReplaceFnStatement;
    }

    if(!stylisCssSandboxPlugin) {
      return match;
    }

    const [obj = '', propName] = right.split('.') || [];
    const objPlaceholder = Array.from({ length: obj.length }, () => ' ').join('');


    // 出现了但是不匹配
    if((!obj || !propName)) {
      console.log(`${right} 解析 hash 值失败 😭`);
      return;
    }

    // 属性表达式改成分号分隔处理 a.____sandboxHash() 调成 空格空格____sandboxHash() 即可
    return `${objPlaceholder} ${propName}`;
  });
  
  const fnStr = rewrittenFn(scopeAttr);
  const hasVarStr = sandboxHash(scopeAttr);

  handled += stylisCssSandboxPlugin ? (fnStr + hasVarStr) : fnStr;

  return handled;
}

const SuffixStrategy = {
  css: prefixSelectorSingle,
  js: rewriteCreateElement,
}


export type CssSandboxOption = ScopeOption & {
  /** 使用该属性会覆盖 scope 属性为 [scopeAttr]，如果 scope 和 scopeAttr 都不传，默认值为 sandbox */
  scopeAttr?: string;
  /** 是否需要对属性值增加 hash，默认为 8 */
  hash?: number;
  /** 是否开启 stylis 插件 */
  stylisCssSandboxPlugin?: boolean;
}

/** 兼容 scopeAttr 属性 并把 hash 值附带上 */
const handleOpt = (opt: CssSandboxOption) => {
  let { hash: len, scopeAttr, scope=''  } = opt;
  len = Number(len || 8);
  const matches = scope.match(/^\[([\s\S]+)\]$/) ?? [];
  const rawMatch = matches[1];
  const rawAttr = scopeAttr || rawMatch || 'sandbox';
  const hash = createHash(len);

  opt.scopeAttr = `${rawAttr}_${hash}`;
  opt.scope = `[${opt.scopeAttr}]`;
  return opt;
}

/**
 * 根据路径来批量给文件夹前缀
 * @param patten glob 路径
 * @param opt 前缀选项
 */
export const cssSandbox = (patten: string, opt: CssSandboxOption = {}) => {
  opt = handleOpt(opt);
  
  const ignoreFilesP : Promise<string[]> = opt.ignoreFiles ? globP(opt.ignoreFiles).then(v => v, () => []) : Promise.resolve([]);

  return loopFiles(patten, async(data, p) => {
    const ignorePaths = await ignoreFilesP;

    // 包含要忽略的文件就跳过
    if(ignorePaths.includes(p)) {
      console.log(`${p} skip 😇`);
      return data;
    }

    const suffix = p.split('.').pop();

    const handleSingle = SuffixStrategy[suffix];

    const res = handleSingle(data, opt);

    console.log(`${p} ✅`);

    return res;
  })
}

// cssSandbox('./test copy/**', {
//   scopeAttr: 'ok',
//   ignoreFiles: './test copy/b.css',
//   stylisCssSandboxPlugin: true,
// })


