import glob from 'glob';
import { readFile, readFileSync, writeFile, writeFileSync } from 'fs';
import { promisify } from 'util';
import path from 'path';
import SHA256 from 'crypto-js/sha256';
import { ICssSandBoxOption, IOption } from '../shared';

export type ICb = (data: string, p: string) => Promise<string | undefined> | string | void;

export const DefaultGlobOpt = { absolute: true, nodir: true };

export const handleGlobProp = (args: any[]) => {
  // 寻找到 options 项，为其增加
  if (typeof args[1] !== 'function') {
    args[1] = args[1] || {};
    args[1] = { ...DefaultGlobOpt, ...args[1] };
  }

  return args;
};

const _globP = promisify(glob);

// @ts-ignore
export const globP: typeof _globP = (...args: any[]) => _globP(...handleGlobProp(args));
// @ts-ignore
export const globSync: (typeof glob)['sync'] = (...args: any[]) => glob.sync(...handleGlobProp(args));

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

export function hasOpt(opt: string, key: string) {
  const opts = new Set(opt.split('.'));
  return opts.has(key);
}

function readFile1(path: string, opt = ''): any {
  if (hasOpt(opt, 'c')) {
    path = cwd(path);
  }
  const rawContent = readFileSync(path, { encoding: 'utf-8' });
  return hasOpt(opt, 'j') ? JSON.parse(rawContent) : rawContent;
}

function writeFile1(path: string, data: any, opt = '') {
  if (hasOpt(opt, 'c')) {
    path = cwd(path);
  }

  data = hasOpt(opt, 'j') ? JSON.stringify(data, undefined, 2) : data;
  writeFileSync(path, data);
}

function changeFile1(path: string, handle: (dt: any) => any, opt = '') {
  const res = readFile1(path, opt);
  const data = handle(res);
  // 如果不返回值则不修改
  if (data == null) return;
  writeFile1(path, data, opt);
}

export { readFile1 as readFile, writeFile1 as writeFile, changeFile1 as changeFile };

export const cwd = (p: string) => path.resolve(process.cwd(), p);
export const relative = (p: string) => path.resolve(__dirname, p);

export const onlyHasPrefix = (opt: ICssSandBoxOption) => Boolean(!opt.scope && opt.prefix);
