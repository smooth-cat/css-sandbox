/*
 * @Description: 通用处理单个 css 字符串替换
 */

import { Log } from './constant';
import { IOption } from './decorator';
import { LimitMap } from './limit-map';
import { pairs } from './pairs';

/** 缓存 css 与 对应处理后的执行结果 */
const memoMap = new LimitMap<string, string>(4000);

/** 处理单个文件字符串 */
export type IHandleSingle = (str: string, opt: IOption) => string;

/**
 * 通用处理单个 css 字符串替换
 * @param str 要被替换的字符串
 * @param {IOption} opt 选项
 * @returns
 */
export const replaceSelector: IHandleSingle = (str: string, opt: IOption) => {
  const notHasSelector = !str.includes('{');
  const hasHandled = str.includes(opt.prefix);

  if (notHasSelector || hasHandled) {
    return str;
  }

  const args = str + JSON.stringify(opt);
  // 缓存
  if (memoMap.has(args)) {
    return memoMap.get(args);
  }

  // 1. 匹配所有选择器，即 match 内容以及 左边界值（选择器）
  const pair = pairs({
    // 匹配非 { | } | ;
    startReg: /([^\{\}\;]*)\{/,
    endReg: /\}/,
    str,
    replacer: ({ startMatch, replacedContent, endMatch, content }) => {
      const selector = startMatch?.subMatches?.[0];
      // 如果是 AtRule 如 @media 媒体查询，当前选择项不做处理
      if (ignoreAtRule(selector)) {
        return startMatch.match + replacedContent + endMatch.match;
      }

      // 如果是 keyFrame 不替换
      if (ignoreKeyFrame(selector)) {
        return startMatch.match + content.match + endMatch.match;
      }

      // 2. 找到 selectors
      const selectors = selector.split(',');

      // 3. 替换
      const handledSelectors = selectors.map((sel: string) => {
        const [s = '', content = '', e = ''] = trimEpt(sel);
        return s + handleSelector(content, opt) + e;
      });

      // 4. 合并
      const handledSelector = handledSelectors.join(',');

      // 5. 添加原来的空格
      return `${handledSelector}{${replacedContent}}`;
    }
  });

  const handled = pair.getReplaced();
  if (opt.debug) {
    debugLog(str, handled);
  }
  // 缓存
  memoMap.set(args, handled);
  return handled;
};

export const debugLog = (raw: string, handled: string) => console.log(Log.Debug, { raw, handled });

export const handleSelector = (selector: string, opt: IOption) => {
  let { prefix, exclude, transform, body, idClassOnly } = opt;
  // 正则排除
  const shouldExclude = exclude && selector.match(exclude);
  // 默认忽略 body
  const ignoreBody = !body && selector === 'body';
  // 选择器中 包含 id\class 才
  const notIdClass = idClassOnly && !selector.match(/[\.#]/);

  if (shouldExclude || ignoreBody || notIdClass) {
    return selector;
  }

  const prefixSelector = `${prefix}${selector}`;

  // 没有处理直接返回带前缀的
  if (transform == null) return prefixSelector;

  // 处理结果
  const res = transform(prefix, selector, prefixSelector);

  // 未返回则不进行替换
  if (res == null) return selector;

  // 返回结果
  return res;
};

export const ignoreAtRule = (selector = '') => {
  const AtRules = [
    '@media',
    '@supports',
    '@document',
    '@page',
    '@font-face',
    '@keyframes',
    '@counter-style',
    '@font-feature-values',
    '@property',
    '@layer'
  ];
  return AtRules.some(it => selector.includes(it));
};

export const ignoreKeyFrame = (selector = '') => {
  // 父级是 keyframe 的不做处理
  const keyframeRules = ['keyframes', '-webkit-keyframes', '-moz-keyframes', '-o-keyframes'];

  return keyframeRules.some(key => selector.includes(key));
};

/** 替换掉选择器前后的空白 */
export const trimEpt = (str: string) => {
  return (str.match(/(\s*)(\S[\s\S]*\S)(\s*)/) || []).slice(1);
};
