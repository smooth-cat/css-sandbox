import { ICssSandBoxOption, Opt, Ovr, SandboxOpt, rewriteCreateElement } from "../../shared";
import { Log } from "../../shared/constant";
import { globP } from "../utils";

class Util {
  @Ovr()
  static replace(js: string, @Opt @SandboxOpt opt: ICssSandBoxOption) {
    return rewriteCreateElement(js, opt)
  }
}

export default async function jsLoader(source: string) {
   /** 完成回调 */
   const callback = this.async();
   /** 处理的文件路径 */
   const filePath = this.resourcePath;
   const opt: ICssSandBoxOption = this.getOptions ? this.getOptions() : this.options;
 
   // 没有忽略文件路径 直接获取结果
   if (!opt.ignoreFiles) {
     callback(null, Util.replace(source, opt));
     return;
   }
 
   // 有忽略文件路径则需要判断是否执行
   try {
     const paths = await globP(opt.ignoreFiles);
 
     const shouldReplace = !paths.includes(filePath);
 
     callback(null, shouldReplace ? Util.replace(source, opt) : source);
   } catch (error) {
     console.error(`${Log.Err}获取忽略文件列表失败！！`);
 
     callback(error);
   }
}
