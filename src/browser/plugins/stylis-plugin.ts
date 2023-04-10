import { Ovr, Opt, IOption, replaceSelector, StylisSandboxOpt, IStylisCssSandBoxOption } from "../../shared";

/** stylis 插件 上下文类型 */
export enum StylisCtxLevel {
  /* post-process context */
  postProcess = -2,
  /* preparation context */
  preparation = -1,
  /* newline context */
  newline = 0,
  /* property context */
  property = 1,
  /* selector block context */
  selector = 2,
  /* @at-rule block context */
  atRule = 3
}

export class StylisPlugin {
  /**
   * 用于 styled-components 的 stylis 插件
   * @param opt 选项
   * @returns fn () => string;
   */
  @Ovr()
  static createStylisPrefixPlugin(@Opt opt: IOption) {
    const fn = (ctx: StylisCtxLevel, str: string) => {
      /** 非 css 类型不处理 */
      const typeNotCss = ctx !== StylisCtxLevel.postProcess;
      if (typeNotCss) {
        return str;
      }
      return replaceSelector(str, opt);
    };

    // styled-components 需要定义 name 属性
    Object.defineProperty(fn, 'name', { value: 'stylis-prefix-selector-plugin' });

    return fn;
  }

  /** 注入 cssSandbox 类名 */
  @Ovr()
  static createStylisSandboxPlugin(@StylisSandboxOpt opt?: IStylisCssSandBoxOption) {
    return StylisPlugin.createStylisPrefixPlugin(opt);
  }
}
