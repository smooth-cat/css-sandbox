const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const { exec, changeFileSync, cwd } = require('./util');
const { version } = pkg;
const newVal = version.replace(/(\w+\.\w+\.)(\w+)/g, (_, left, right) => {
  return left + (Number(right)+1);
})



// 构建
exec('pnpm build');

// 改版本
pkg.version = newVal;
fs.writeFileSync(path.resolve(process.cwd(), './package.json'), JSON.stringify(pkg, undefined, 2)+'\n');


changeFileSync(cwd('./.npmrc'), () => `registry = "https://registry.npmjs.com"`);

try {
  // 发布
  exec('npm publish  --access=public');
  console.log(`${newVal} 发布成功🤡~`)
} catch() {
  console.log(`${newVal} 发布失败😭~`);
};

changeFileSync(cwd('./.npmrc'), () => `registry = "https://registry.npmmirror.com"`);
