import glob from 'glob';
import { readFile, readFileSync, writeFile, writeFileSync } from 'fs';
import { promisify } from 'util';
import path from 'path';
import SHA256 from 'crypto-js/sha256';
import { ICssSandBoxOption, IOption } from '../shared';

export type ICb = (data: string, p: string) => Promise<string | undefined> | string | void;

export const globP = promisify(glob);
export const CONF = { encoding: 'utf-8' } as const;
export const loopFiles = (pattern: string, cb?: ICb) => {
  return new Promise<boolean>(rawR => {
    glob(pattern, { absolute: true }, (e, files) => {
      if (e) return rawR(false);
      let count = 0;
      const max = files.length;
      const resolve = (x: boolean) => {
        count++;
        if (count === max) {
          rawR(x);
        }
      };
      files.forEach(p => {
        readFile(p, CONF, async (e, data) => {
          if (e) return resolve(false);
          const res = await cb(data, p);
          if (typeof res === 'string') {
            writeFile(p, res, e => {
              resolve(!e);
            });
          } else {
            resolve(true);
          }
        });
      });
    });
  });
};

/** path */
export function readJsonSync(path: string) {
  const res = JSON.parse(readFileSync(path, CONF));
  return res;
}

// export function writeJsonSync(path: string, data: any) {
//   /** 标准两空格缩进 */
//   writeFileSync(path, JSON.stringify(data, null, '  '));
// }

// export function changeJsonSync(path: string, handle: (dt: any) => any) {
//   const res = readJsonSync(path);
//   const data = handle(res);
//   writeJsonSync(path, data);
// }

function hasOpt(opt: string, key: string) {
  const opts = new Set(opt.split('.'));
  return opts.has(key);
}

function readFile1(path: string, opt=''): any {
  if(hasOpt(opt, 'c')) {
    path = cwd(path);
  }
  const rawContent = readFileSync(path, {'encoding': 'utf-8'});
  return hasOpt(opt, 'j') ? JSON.parse(rawContent) : rawContent;
}

function writeFile1(path: string, data: any, opt='') {
  if(hasOpt(opt, 'c')) {
    path = cwd(path);
  }

  data = hasOpt(opt, 'j') ? JSON.stringify(data) : data;
  writeFileSync(path, data);
}

function changeFile1(path: string, handle: (dt: any) => any, opt='') {
  const res = readFile1(path, opt);
  const data = handle(res);
  writeFile1(path, data, opt);
}

export {
  readFile1 as readFile,
  writeFile1  as writeFile,
  changeFile1  as changeFile,
}

export const cwd = (p: string) => path.resolve(process.cwd(), p);
export const relative = (p: string) => path.resolve(__dirname, p);

/** 生成 hash */
export const createHash = (len: number) => {
  const TimeStamp = String(Date.now());
  const hash = SHA256(TimeStamp).toString().substring(0, len); // 输出前 16 个字符作为 hash 值
  return hash;
};

export const onlyHasPrefix = (opt: ICssSandBoxOption) => !opt.scope && opt.prefix;
