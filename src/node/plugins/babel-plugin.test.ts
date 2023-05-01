import { initFile } from '../../../jest-config/utils';
import { BabelPlugin } from './babel-plugin';
import { transformFileSync } from '@babel/core';
import path from 'path';

/** initFile 初始化的目录含有的文件与 test 文件相同, 由于这里不涉及修改文件，只构建一次虚拟目录即可 */
const dirName = initFile(__filename);
const jsFilePath = path.resolve(dirName, 'a.js');

describe('createSandboxPlugin', () => {
  it('使用默认 css 沙箱名替换', () => {
    const plugin = BabelPlugin.createSandboxPlugin({});
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    expect(res).toMatchSnapshot();
  });

  it('使用自定义 css 沙箱名 my-sandbox', () => {
    const plugin = BabelPlugin.createSandboxPlugin({
      scope: 'my-sandbox'
    });
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    expect(res).toMatchSnapshot();
  });

  it('忽略文件', () => {
    const plugin = BabelPlugin.createSandboxPlugin({
      ignoreFiles: `${dirName}/**`
    });
    const res = transformFileSync(jsFilePath, { plugins: [plugin] })?.code;
    const raw = transformFileSync(jsFilePath)?.code;
    expect(res).toBe(raw);
  });
});
