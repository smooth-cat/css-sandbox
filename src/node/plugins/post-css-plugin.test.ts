import postcss from 'postcss';
import { PostCssPlugin } from './post-css-plugin';
import { ICssSandBoxOption } from '../../shared';
import { initFile } from '../../../jest-config/utils';
import fs from 'fs';
import path from 'path';

const dir = initFile(__filename);
const cssFilePath = path.resolve(dir, './a.css');
const css = fs.readFileSync(cssFilePath, 'utf-8');

const callPlugin = async (css: string, fn: Function, opt: ICssSandBoxOption) => {
  const plugin = fn(opt);
  return postcss([plugin])
    .process(css, { from: cssFilePath })
    .then(res => res.css);
};

describe('createPrefixPlugin', () => {
  it('1.指定前缀', async () => {
    const res = await callPlugin(css, PostCssPlugin.createPrefixPlugin, {
      prefix: '.my-app '
    });
    expect(res).toMatchSnapshot();
  });
  
  it('2.打印 debug 日志', async () => {
    const spier = jest.spyOn(console, 'log');
    await callPlugin(css, PostCssPlugin.createPrefixPlugin, {
      prefix: '.my-app ',
      debug: true
    });
    expect(spier).toBeCalled();
  });
});

describe('createSandboxPlugin', () => {
  it('1.使用默认 css 沙箱名替换', async () => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {});
    expect(res).toMatchSnapshot();
  });

  it('2.使用自定义 css 沙箱名', async () => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {
      scope: 'my-sandbox'
    });
    expect(res).toMatchSnapshot();
  });

  it('3.忽略文件', async () => {
    const res = await callPlugin(css, PostCssPlugin.createSandboxPlugin, {
      ignoreFiles: `${dir}/**`
    });
    expect(res).toBe(css);
  });
});
