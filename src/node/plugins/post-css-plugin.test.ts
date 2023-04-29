import postcss from 'postcss';
import { cwd, readFile } from '../utils';
import { PostCssPlugin } from './post-css-plugin';
import { transformFileSync } from '@babel/core';
import { ICssSandBoxOption, IOption } from '../../shared';

const cssFilePath = cwd('./test/a.css');
const css = readFile(cssFilePath);
const callPlugin = async (css: string, fn: Function, opt: ICssSandBoxOption) => {
  const plugin = fn(opt);
  return postcss([plugin])
    .process(css, { from: cssFilePath })
    .then(res => res.css);
};

describe('createPrefixPlugin', () => {
  it('1.指定前缀', async() => {
    const res = await callPlugin(css, PostCssPlugin.createPrefixPlugin, {
      prefix: '.my-app ',
    });
    expect(res).toMatchSnapshot();
  });
});

describe('createSandboxPlugin', () => {
  it('1.使用默认 css 沙箱名替换', async() => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {});
    expect(res).toMatchSnapshot();
  });

  it('2.使用自定义 css 沙箱名', async () => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {
      scope: 'my-sandbox'
    });
    expect(res).toMatchSnapshot();
  });

  it('3.忽略文件', async() => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {
      ignoreFiles: './test/**'
    });
    expect(res).toBe(css); 
  });

});


