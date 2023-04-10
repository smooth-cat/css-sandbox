import { program } from 'commander';
import { readJsonSync, cwd } from './utils';
import { CssSandbox } from './css-sandbox';

const pkg = readJsonSync(cwd('./package.json'));

export const execCli = () => {
  program.name('css-sandbox').description('css 沙箱 / 选择器替换').version(pkg.version);

  program
    .argument('<bundle>', 'glob 定义的文件夹路径 https://www.npmjs.com/package/glob')
    .option('-s, --scope <scope>', '做 css 沙箱隔离时使用的 scope 属性 (优先级高于 prefix, 在每个选择器前附加 [scope])')
    .option('-p, --prefix <prefix>', '处理 css 文件的选择器前缀 (这种方式不会替换 document.createElement)')
    .option('-e, --exclude <exclude>', '无需处理的选择器')
    .option('-if, --ignore-files <ignore-files>', '无需处理的文件，使用 glob 语法')
    .option('-hs, --hash <hash>', `hash 长度`)
    .option('-b, --body', `是否修改 body 为 \`body\${prefix}\``)
    .option('-o, --id-class-only', `只对 包含 id 或 class 选择器 的做替换`)
    .option('-sl, --stylis-css-sandbox-plugin', `是否与 stylis-css-sandbox-plugin 联动`)
    .action((patten, opt) => {
      (!opt.scope && opt.prefix) ? CssSandbox.prefix(patten, opt) : CssSandbox.sandbox(patten, opt);
    });

  program.parse();
};
