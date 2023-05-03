import { handleSelector, ignoreAtRule, ignoreKeyFrame, replaceSelector, trimEpt } from './handle-css-file';
import { initFile } from '../../jest-config/utils';
import fs from 'fs';
import path from 'path';
const dir = initFile(__filename);
const css = fs.readFileSync(path.resolve(dir, 'a.css'), 'utf-8');
describe('replaceSelector', () => {
  it('处理css字符串，给每个 selector 加前缀', () => {
    const res = replaceSelector(css, { prefix: '.my-app ' });
    expect(res).toMatchSnapshot();
  });

  it('处理css字符串，给每个 selector 加前缀，仅对 id-class 选择器生效', () => {
    const res = replaceSelector(css, { prefix: '.my-app ', idClassOnly: true });
    expect(res).toMatchSnapshot();
  });

  it('处理css字符串，给每个 selector 加前缀，排除 #main', () => {
    const res = replaceSelector(css, { prefix: '.my-app ', exclude: /#main/ });
    expect(res).toMatchSnapshot();
  });

  it('处理css字符串，给每个 selector 加前缀，指定 transform 处理', () => {
    const res = replaceSelector(css, {
      prefix: 'my-app',
      transform: (prefix: string, selector: string, prefixedSelector: string) => {
        expect(prefix).toBe('my-app');
        return `.${prefix} ${selector}`;
      }
    });
    expect(res).toMatchSnapshot();
  });

  it('处理css字符串，给每个 selector 加前缀，指定 作用于 body 选择器', () => {
    const res = replaceSelector(css, {
      prefix: '[css-sandbox]',
      body: true
    });
    expect(res).toMatchSnapshot();
  });
});

describe('handleSelector', () => {
  it('给 selector 增加前缀', () => {
    expect(handleSelector('.aaa', { prefix: '.my-app ' })).toBe('.my-app .aaa');
  });

  it('给 selector 增加前缀, 仅对 id、class 选择器生效', () => {
    expect(handleSelector('.aaa', { prefix: '.my-app ', idClassOnly: true })).toBe('.my-app .aaa');
    expect(handleSelector('div ul li', { prefix: '.my-app ', idClassOnly: true })).toBe('div ul li');
  });

  it('给 selector 增加前缀, 排除 #main', () => {
    expect(handleSelector('.aaa', { prefix: '.my-app ', exclude: /#main/ })).toBe('.my-app .aaa');
    expect(handleSelector('#app #main', { prefix: '.my-app ', exclude: /#main/ })).toBe('#app #main');
  });

  it('给 selector 增加前缀, 指定 transform 处理', () => {
    expect(
      handleSelector('.aaa', { prefix: 'my-app', transform: (prefix, selector) => `[${prefix}]${selector}` })
    ).toBe('[my-app].aaa');
  });
});

describe('ignoreAtRule', () => {
  it('检测选择器包含 css At Rules', () => {
    const atRulesSelector = ['@keyframes pulse', '@media only screen and (min-device-width: 320px)', '@font-face'];
    atRulesSelector.forEach(selector => {
      expect(ignoreAtRule(selector)).toBe(true);
    });
  });
});

describe('ignoreKeyFrame', () => {
  it('检测包含 keyframe 选择器', () => {
    const keyframeSelector = ['keyframes', '-webkit-keyframes', '-moz-keyframes', '-o-keyframes'];
    keyframeSelector.forEach(selector => {
      expect(ignoreKeyFrame(selector)).toBe(true);
    });
  });
});

describe('trimEpt', () => {
  it('分离字符串和其前后空格，按序存放于数组中', () => {
    expect(trimEpt('\n\t   aa\nbbbb  \t')).toEqual(['\n\t   ', 'aa\nbbbb', '  \t']);
  });
});
