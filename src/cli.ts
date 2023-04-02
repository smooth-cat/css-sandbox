import { program } from 'commander';
import { readJsonSync } from './utils';
import { cssSandbox } from './prefix-selector';
import { cwd } from './utils';
const pkg = readJsonSync(cwd('./package.json'));

export const execCli = () => {
  program
    .name('css-sandbox')
    .description('css 沙箱选择器替换')
    .version(pkg.version);
  
  program
    .argument('<bundle>', 'glob 定义的文件夹路径 https://www.npmjs.com/package/glob')
    .option('-s, --scope <scope>', '需添加的 css 前缀选择器(会加在每个选择器的开头)')
    .option('-e, --exclude <exclude>', '无需处理的选择器')
    .option('-if, --ignore-files <ignore-files>', '无需处理的文件，使用 glob 语法')
    .option('-hs, --hash <hash>', `hash 长度`)
    .option('-b, --body', `是否修改 body 为 \`body\${prefix}\``)
    .option('-o, --id-class-only', `只对 包含 id 或 class 选择器 的做替换`)
    .option('-sl, --stylis-css-sandbox-plugin', `是否与 stylis-css-sandbox-plugin 联动`)
    .action((patten, opt) => {
      cssSandbox(patten, opt);
    })
  
  program.parse();
}

