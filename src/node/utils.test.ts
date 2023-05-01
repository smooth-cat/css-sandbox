import fs from 'fs';
import path from 'path';
import {
  loopFiles,
  cwd,
  readFile,
  writeFile,
  globSync,
  handleGlobProp,
  DefaultGlobOpt,
  hasOpt,
  changeFile,
  relative,
  onlyHasPrefix
} from './utils';
import { initFile } from '../../jest-config/utils';

const copyDir = initFile(__filename);
const TempText = 'hello world';
const TempJson = {
  hello: 'world'
};
const cssFile = `${copyDir}/a.css`;
const jsonFile = `${copyDir}/a.json`;
const copyStar = `${copyDir}/**`;

describe('handleGlobProp 方法', () => {
  it('重写props', () => {
    const args = handleGlobProp(['', {}]);
    // args[1] 包含 重写 props
    expect({ ...args[1], ...DefaultGlobOpt }).toEqual(args[1]);
  });

  it('第二个参数为 函数', () => {
    const args = handleGlobProp(['']);
    // args[1] 包含 重写 props
    expect(args).toEqual(args);
  });

  it('第二个参数为 undefined', () => {
    const args = handleGlobProp(['']);
    // args[1] 包含 重写 props
    expect({ ...args[1], ...DefaultGlobOpt }).toEqual(args[1]);
  });

  it('第二个参数重写', () => {
    const args = handleGlobProp(['', { absolute: false }]);
    // args[1] 包含 重写 props
    expect(args[1].absolute).toBe(false);
  });
});

describe('loopFiles 方法', () => {
  afterEach(() => {
    initFile(__filename);
  });

  it('替换文件', async () => {
    const replaceText = 'hello world';
    return loopFiles(copyStar, () => {
      return replaceText;
    }).then(() => {
      globSync(copyStar).forEach(path => {
        const res = fs.readFileSync(path, 'utf-8');
        expect(res).toBe(replaceText);
      });
    });
  });

  it('读取次数', async () => {
    const spier = jest.fn();
    const files = fs.readdirSync(copyDir);
    // test 文件夹下有 3 个文件
    return loopFiles(copyStar, spier).then(() => {
      expect(spier).toBeCalledTimes(files.length);
    });
  });
});

describe('hasOpt 方法', () => {
  it('包含j选项', () => {
    expect(hasOpt('c.j', 'j')).toBe(true);
  });

  it('不包含j选项', () => {
    expect(hasOpt('c.d', 'j')).toBe(false);
  });
});

describe('readFile 方法', () => {
  it('读取文件', () => {
    expect(readFile(cssFile)).toBe(fs.readFileSync(cssFile, 'utf-8'));
  });

  it('读取json文件', () => {
    expect(readFile(jsonFile, 'j')).toMatchSnapshot();
  });
});

describe('writeFile 方法', () => {
  afterEach(() => {
    initFile(__filename);
  });

  it('写入文件', () => {
    writeFile(cssFile, TempText);
    expect(fs.readFileSync(cssFile, 'utf-8')).toBe(TempText);
  });

  it('写入JSON文件', () => {
    writeFile(jsonFile, TempJson, 'j');
    const jsonStr = fs.readFileSync(jsonFile, 'utf-8');
    expect(JSON.parse(jsonStr)).toEqual(TempJson);
  });
});

describe('changeFile 方法', () => {
  afterEach(() => {
    initFile(__filename);
  });

  it('读取文件内容', () => {
    changeFile(cssFile, data => {
      expect(fs.readFileSync(cssFile, 'utf-8')).toBe(data);
    });
  });

  it('读取 json 文件内容', () => {
    changeFile(
      jsonFile,
      data => {
        expect(JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))).toEqual(data);
      },
      'c.j'
    );
  });

  it('修改文件内容', () => {
    changeFile(cssFile, _ => TempText, 'c');
    expect(fs.readFileSync(cssFile, 'utf-8')).toBe(TempText);
  });

  it('修改json文件内容', () => {
    changeFile(jsonFile, _ => TempJson, 'c.j');
    expect(JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))).toEqual(TempJson);
  });
});

describe('cwd', () => {
  it('获取执行路径下的 temp.js', () => {
    expect(cwd('./temp.js')).toBe(path.resolve(process.cwd(), './temp.js'));
  });
});

describe('relative', () => {
  it('获取当前文件夹路径下的 temp.js', () => {
    expect(relative('./temp.js')).toBe(path.resolve(__dirname, './temp.js'));
  });
});

describe('onlyHasPrefix', () => {
  it('scope 和 prefix 同时有', () => {
    expect(onlyHasPrefix({ scope: '123', prefix: '[123]' })).toBe(false);
  });

  it('只有 scope', () => {
    expect(onlyHasPrefix({ scope: '123' })).toBe(false);
  });

  it('只有 prefix', () => {
    expect(onlyHasPrefix({ prefix: '[123]' })).toBe(true);
  });
});
