import {
  ICssSandBoxOption,
  IOption,
  Opt,
  Ovr,
  SandboxOpt,
  replaceSelector,
  simpleRewriteCreateElement
} from '../shared';
import { globP, loopFiles } from './utils';
import path from 'path';

export class CssSandbox {
  private static base(patten: string, opt: IOption, handleJs = false) {
    const SuffixStrategy = {
      css: replaceSelector,
      // TODO: 补充复杂替换
      js: opt.simpleReplaceCreateElement ? simpleRewriteCreateElement : simpleRewriteCreateElement
    };

    const ignoreFilesP: Promise<string[]> = opt.ignoreFiles
      ? globP(opt.ignoreFiles, { absolute: true }).then(
          v => v,
          () => []
        )
      : Promise.resolve([]);

    return loopFiles(patten, async (data, p) => {
      // 只处理 js 和 css 文件
      if (!p.match(/(\.js|\.css)$/)) {
        console.log(`${p} 不处理 ${path.extname(p)} 文件 😇`);
        return;
      }

      const ignorePaths = await ignoreFilesP;

      if (!handleJs && p.endsWith('.js')) {
        console.log(`${p} prefix 方法不处理 js文件 😇`);
        return;
      }

      // 包含要忽略的文件就跳过
      if (ignorePaths.includes(p)) {
        console.log(`${p} skip 😇`);
        return data;
      }

      const suffix = p.split('.').pop();

      const handleSingle = SuffixStrategy[suffix];

      const res = handleSingle?.(data, opt) ?? data;

      console.log(`${p} ✅`);

      return res;
    });
  }

  @Ovr()
  static prefix(patten: string, @Opt opt: IOption) {
    return CssSandbox.base(patten, opt, false);
  }

  @Ovr()
  static sandbox(patten: string, @Opt @SandboxOpt opt?: ICssSandBoxOption) {
    return CssSandbox.base(patten, opt, true);
  }
}

// CssSandbox.sandbox('./test copy/**', {
//   scope: 'ok',
//   ignoreFiles: './test copy/b.css',
//   idClassOnly: true
// });

// CssSandbox.sandbox('./test copy/**')
