import path from 'path';
import fs from 'fs';

export const mkdirR = (path: string) => {
  const paths = path.split('/').filter(it => it);
  paths.forEach((_, i) => {
    const dir = '/' + paths.slice(0, i + 1).join('/');
    try {
      fs.mkdirSync(dir);
    } catch (error) {}
  });
};

function delDIrR(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // 如果是目录，则递归调用
        delDIrR(curPath);
      } else {
        // 如果是文件，则删除
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path); // 删除目录本身
  }
}

export const initFile = (jsFileName: string) => {
  const fileName = path.basename(jsFileName, '.test.ts');
  const baseDir = path.dirname(jsFileName);
  const dirName = path.resolve(baseDir, fileName);
  // 删除原有的
  delDIrR(dirName);
  // 创建与 .test.ts 文件同名的虚拟目录
  mkdirR(dirName);

  // 基于 /test 目录创建虚拟文件
  globalThis['fileList'].map(({ name, content }) => {
    fs.writeFileSync(path.resolve(dirName, name), content);
  });

  return dirName;
};

export const MockHash = '12345678';
export const DefaultScope = 'css-sandbox';
