import { readFileSync } from 'fs';
import { initFile } from '../../jest-config/utils';
import { resolve } from 'path';
import { rewrittenFn, sandboxHash, simpleRewriteCreateElement } from './handle-js-file';
const dir = initFile(__filename);
const js = readFileSync(resolve(dir, 'a.js'), 'utf-8');
describe('rewrittenFn', () => {
  it('生成重写的 documentDCreateElement 方法', () => {
    expect(rewrittenFn('css-sandbox')).toMatchSnapshot(); 
  })
})

describe('sandboxHash', () => {
  it('生成重写的 sandboxHash 方法', () => {
    expect(sandboxHash('css-sandbox')).toMatchSnapshot(); 
  })
})

describe('simpleRewriteCreateElement', () => {
  it('通过 scope 重写 js 文件', () => {
    expect(simpleRewriteCreateElement(js, { scope: '[css-sandbox]' })).toMatchSnapshot()
  })
})