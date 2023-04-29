import { readFile } from '../../node/utils';
import { IOption } from '../../shared';
import { StylisCtxLevel, StylisPlugin } from './stylis-plugin';
const css = readFile('./test/a.css', 'c');

const callPlugin = (css: string, fn: Function, opt: IOption) => fn(opt)(StylisCtxLevel.postProcess, css);


describe('createPrefixPlugin 方法', () => {
  it('增加前缀类名 my-app', () => {
    const res = callPlugin(css, StylisPlugin.createPrefixPlugin, {
      prefix: '.my-app '
    })
    expect(res).toMatchSnapshot()
  })
});


describe('createSandboxPlugin 方法', () => {
  it('css 沙箱给方法增加一个 [css-sandbox] 的hash，这个值是通过编译时 js 替换得到的 src/shared/handle-js-file 有具体操作', () => {
    const res = callPlugin(css, StylisPlugin.createSandboxPlugin, {});
    expect(res).toMatchSnapshot()
  })
});