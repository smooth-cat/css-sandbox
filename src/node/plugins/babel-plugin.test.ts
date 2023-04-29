import { cwd, readFile } from '../utils';
import { BabelPlugin } from './babel-plugin';
import { transformFileSync } from '@babel/core';

const jsFilePath = cwd('./test/a.js');

describe('createSandboxPlugin', () => {
  it('使用默认 css 沙箱名替换', () => {
    const plugin = BabelPlugin.createSandboxPlugin({});
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    expect(res).toMatchSnapshot();
  });

  it('使用自定义 css 沙箱名', () => {
    const plugin = BabelPlugin.createSandboxPlugin({
      scope: 'my-sandbox'
    });
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    expect(res).toMatchSnapshot();
  });

  it('忽略文件', () => {
    const plugin = BabelPlugin.createSandboxPlugin({
      ignoreFiles: './test/**'
    });
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    const raw = transformFileSync(jsFilePath)?.code;
    expect(res).toBe(raw);
  });
});
