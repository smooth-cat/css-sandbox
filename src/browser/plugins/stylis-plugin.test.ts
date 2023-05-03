import path from 'path';
import { initFile } from '../../../jest-config/utils';
import { IOption } from '../../shared';
import { StylisCtxLevel, StylisPlugin } from './stylis-plugin';
import fs from 'fs';

const dir = initFile(__filename);
const css = fs.readFileSync(path.resolve(dir, 'a.css'), 'utf-8');

const callPlugin = (css: string, fn: Function, opt: IOption) => fn(opt)(StylisCtxLevel.postProcess, css);

describe('createPrefixPlugin 方法', () => {
  it('增加前缀类名 my-app', () => {
    const res = callPlugin(css, StylisPlugin.createPrefixPlugin, {
      prefix: '.my-app '
    });
    expect(res).toMatchSnapshot();
  });

  it('非css类型上下文', () => {
    const res = StylisPlugin.createPrefixPlugin({ prefix: '.my-app ' })(StylisCtxLevel.newline, css);
    expect(res).toBe(css);
  });
});

describe('createSandboxPlugin 方法', () => {
  it('css 沙箱给方法增加一个 [css-sandbox] 的hash，这个值是通过编译时 js 替换得到的 src/shared/handle-js-file 有具体操作', () => {
    const res = callPlugin(css, StylisPlugin.createSandboxPlugin, {});
    expect(res).toMatchSnapshot();
  });
});
