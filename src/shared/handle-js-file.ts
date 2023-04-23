import { ICssSandBoxOption } from './decorator';

export const CreateElementStatement = 'document.createElement';

export const SandboxHashPropStatement = '\\w+.____sandboxHash\\(\\)';
export const ReplaceFnStatement = 'documentDCreateElement';
export const rewrittenFn = (attr: string) =>
  `\nfunction ${ReplaceFnStatement}(...args){var el=document.createElement(...args);el.setAttribute('${attr}');return el;}`;

export const sandboxHash = (attr: string) => `\nfunction ____sandboxHash(){return '${attr}';}`;

export type IWriteSingle = (css: string, opt: ICssSandBoxOption) => string;

export const simpleRewriteCreateElement: IWriteSingle = (js, opt = {}) => {
  const { scope, stylisCssSandboxPlugin } = opt;

  const regStr = `(${CreateElementStatement})|(${SandboxHashPropStatement})`;

  let handled = js.replace(new RegExp(regStr, 'g'), (match, left, right) => {
    if (left) {
      return ReplaceFnStatement;
    }

    if (!stylisCssSandboxPlugin) {
      return match;
    }

    const [obj = '', propName] = right.split('.') || [];
    const objPlaceholder = Array.from({ length: obj.length }, () => ' ').join('');

    // 出现了但是不匹配
    if (!obj || !propName) {
      console.log(`${right} 解析 hash 值失败 😭`);
      return;
    }

    // 属性表达式改成分号分隔处理 a.____sandboxHash() 调成 空格空格____sandboxHash() 即可
    return `${objPlaceholder} ${propName}`;
  });

  const fnStr = rewrittenFn(scope);
  const hasVarStr = sandboxHash(scope);

  handled += stylisCssSandboxPlugin ? fnStr + hasVarStr : fnStr;

  return handled;
};
