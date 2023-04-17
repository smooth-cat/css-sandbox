import { ICssSandBoxOption } from "../../shared";
import { loopTree } from "../../shared/loop-tree";
import { RuleSetRule } from 'webpack';

const CssSuffix = ['css', 'less', 'scss', 'sass'];
const JsSuffix = ['js', 'jsx', 'ts', 'tsx'];

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
        rule.test
      }
    })
  }

  handleCssUses = () => {
    
  }

  handleJsUses = () => {

  }
}