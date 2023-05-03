import { CssSandbox } from './css-sandbox';
import { loopFiles } from './utils';
import { initFile } from '../../jest-config/utils';
const dir = initFile(__filename);
describe('prefix 方法', () => {
  afterEach(() => initFile(__filename));

  it('给css文件增加前缀 .my-app', async () => {
    await CssSandbox.prefix(`${dir}/**`, {
      prefix: '.my-app '
    });

    let str = '';
    await loopFiles(`${dir}/*.+(js|css)`, data => {
      str += '\n' + data;
    });

    expect(str).toMatchSnapshot();
  });

  it('给css文件增加前缀忽略 b.css .my-app', async () => {
    await CssSandbox.prefix(`${dir}/**`, {
      prefix: '.my-app ',
      ignoreFiles: `${dir}/b.css`
    });

    let str = '';
    await loopFiles(`${dir}/*.+(js|css)`, data => {
      str += '\n' + data;
    });

    expect(str).toMatchSnapshot();
  });
});

describe('sandbox 方法', () => {
  afterEach(() => initFile(__filename));

  it('给css文件增加属性沙箱 [my-sandbox]', async () => {
    await CssSandbox.sandbox(`${dir}/**`, {
      scope: 'my-sandbox'
    });

    let str = '';
    await loopFiles(`${dir}/*.+(js|css)`, data => {
      str += '\n' + data;
    });

    expect(str).toMatchSnapshot();
  });
});
