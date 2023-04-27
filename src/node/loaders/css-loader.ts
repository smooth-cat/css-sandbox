import { ICssSandBoxOption, IOption, Opt, Ovr, SandboxOpt, handleSelector, replaceSelector } from '../../shared';
import { Log } from '../../shared/constant';
import { globP, onlyHasPrefix } from '../utils';

class Util {
  @Ovr()
  static runPrefix(source: string, @Opt opt: IOption) {
    return replaceSelector(source, opt);
  }

  @Ovr()
  static runSandbox(source: string, @Opt @SandboxOpt opt: ICssSandBoxOption) {
    return replaceSelector(source, opt);
  }
}
export default async function cssLoader(this: any, source: string) {
  /** 完成回调 */
  const callback = this.async();
  /** 处理的文件路径 */
  const filePath = this.resourcePath;
  const opt: ICssSandBoxOption = this.getOptions ? this.getOptions() : this.options;
  const getResult = () => (onlyHasPrefix(opt) ? Util.runPrefix(source, opt) : Util.runSandbox(source, opt));

  // 没有忽略文件路径 直接获取结果
  if (!opt.ignoreFiles) {
    callback(null, getResult());
    return;
  }

  // 有忽略文件路径则需要判断是否执行
  try {
    const paths = await globP(opt.ignoreFiles, { absolute: true });

    const shouldReplace = !paths.includes(filePath);

    callback(null, shouldReplace ? getResult() : source);
  } catch (error) {
    console.error(`${Log.Err}获取忽略文件列表失败！！`);

    callback(error);
  }
}
