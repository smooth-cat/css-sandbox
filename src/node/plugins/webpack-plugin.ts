import { ICssSandBoxOption } from '../../shared';
import { loopTree } from '../../shared/loop-tree';
import { RuleSetRule } from 'webpack';

const CssSuffix = ['css', 'less', 'scss', 'sass'];
const JsSuffix = ['js', 'jsx', 'ts', 'tsx'];

/**
 * @deprecated 暂不支持，考虑到 vue， react 框架复杂的 loader 逻辑
 */
export class WebpackPlugin {
  options: ICssSandBoxOption;
  constructor(opt: ICssSandBoxOption) {
    this.options = opt;
  }
  apply(compiler: any) {
    const rules: RuleSetRule[] = compiler?.options?.module?.rules || [];
    loopTree({
      list: rules,
      children: 'oneOf',
      leave(rule) {
        rule.test;
      }
    });
  }

  handleCssUses = () => {};

  handleJsUses = () => {};
}
