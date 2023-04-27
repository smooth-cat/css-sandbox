import postcss, { TransformCallback } from 'postcss';
import {
  Ovr,
  Opt,
  IOption,
  ignoreKeyFrame,
  handleSelector,
  debugLog,
  SandboxOpt,
  ICssSandBoxOption,
  DropHashOpt
} from '../../shared';
import { readFileSync, writeFileSync } from 'fs';
import { cwd } from '../utils';
import { glob } from 'glob';

// postcss 会对改变后的 ast 重新触发 Rule
const walked = new WeakSet();

export class PostCssPlugin {
  @Ovr()
  static createPrefixPlugin(@Opt opt: IOption) {
    const { ignoreFiles, debug } = opt;

    const ignoreFilePaths = ignoreFiles ? glob.sync(ignoreFiles, { absolute: true }) : [];

    return function (root, result) {
      // 判断忽略的文件
      const filePath = root?.source?.input?.file;

      if (filePath && ignoreFilePaths.includes(filePath)) return;

      // 获取原始字符串
      const raw = root.toString();

      root.walkRules(node => {
        if (walked.has(node)) return;
        walked.add(node);

        if (ignoreKeyFrame(node?.parent?.['name'])) return;

        const selectors = [...node.selectors];

        node.selectors = selectors.map((selector: string) => {
          const res = handleSelector(selector, opt);
          return res;
        });
      });
      const res = result.css;

      // 获取修改后字符串
      debug && debugLog(raw, res);
    } as TransformCallback;
  }

  @Ovr()
  static createSandboxPlugin(@SandboxOpt @DropHashOpt opt?: ICssSandBoxOption) {
    return PostCssPlugin.createPrefixPlugin(opt);
  }
}

// const plugin = PostCssPlugin.createSandboxPlugin({
//   scope: 'my-sandbox',
//   ignoreFiles: './test copy/**'
// });
// const file = cwd('./test copy/a.css');

// const css = readFileSync(file, { encoding: 'utf-8' });
// postcss([plugin])
//   .process(css, { from: file })
//   .then(res => {
//     console.log(res.css);
//     writeFileSync(file, res.css);
//   });
