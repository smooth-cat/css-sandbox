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

export function writeJsonSync(path: string, data: any) {
  /** 标准两空格缩进 */
  writeFileSync(path, JSON.stringify(data, null, '  '));
}

export function changeJsonSync(path: string, handle: (dt: any) => any) {
  const res = readJsonSync(path);
  const data = handle(res);
  writeJsonSync(path, data);
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
