import { ICssSandBoxOption } from './decorator';

export const CreateElementStatement = 'document.createElement';

/** ____sandboxHash_____ 标识符 */
export const SandboxHashId = '____sandboxHash_____';

export const SandboxHashPropStatement = `\\w+.${SandboxHashId}\\(\\)`;
export const ReplaceFnStatement = 'documentDCreateElement';
export const rewrittenFn = (attr: string) =>
  `\nfunction ${ReplaceFnStatement}(...args){var el=document.createElement(...args);el.setAttribute('${attr}');return el;}`;

export const sandboxHash = (attr: string) => `\nfunction ${SandboxHashId}(){return '${attr}';}`;

export type IWriteSingle = (css: string, opt: ICssSandBoxOption) => string;

export const simpleRewriteCreateElement: IWriteSingle = (js, opt = {}) => {
  const { scope } = opt;

  const regStr = `(${CreateElementStatement})|(${SandboxHashPropStatement})`;

  let matchedCreateElement = false;
  let matchedSandboxHash = false;

  let handled = js.replace(new RegExp(regStr, 'g'), (match, left, right) => {
    if (left) {
      matchedCreateElement = true;
      return ReplaceFnStatement;
    }

    const [obj = '', propName] = right.split('.') || [];
    const objPlaceholder = Array.from({ length: obj.length }, () => ' ').join('');

    // 出现了但是不匹配
    if (!obj || !propName) {
      console.log(`${right} 解析 hash 值失败 😭`);
      return;
    }

    matchedSandboxHash = true;
    // 属性表达式改成分号分隔处理 a.____sandboxHash_____() 调成 空格空格____sandboxHash_____() 即可
    return `${objPlaceholder} ${propName}`;
  });

  const fnStr = matchedCreateElement ? rewrittenFn(scope) : '';
  const sandboxHashVal = matchedSandboxHash ? sandboxHash(scope) : '';

  handled += fnStr + sandboxHashVal;

  return handled;
};
