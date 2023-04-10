import { TransformCallback } from 'postcss';
import {
  Ovr,
  Opt,
  IOption,
  ignoreKeyFrame,
  handleSelector,
  debugLog,
  SandboxOpt,
  ICssSandBoxOption
} from '../../shared';

// postcss 会对改变后的 ast 重新触发 Rule
const walked = new WeakSet();

export class PostCssPlugin {
  @Ovr()
  static createPostCssPrefixPlugin(@Opt opt: IOption) {
    return function (root, result) {
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
      opt.debug && debugLog(raw, res);
    } as TransformCallback;
  }

  @Ovr()
  static createPostCssSandboxPlugin(@SandboxOpt opt?: ICssSandBoxOption) {
    return PostCssPlugin.createPostCssPrefixPlugin(opt);
  }
}
