import {
  DropHashOpt,
  ICssSandBoxOption,
  Opt,
  Ovr,
  ReplaceFnStatement,
  SandboxHashId,
  SandboxOpt,
  rewrittenFn,
  sandboxHash
} from '../../shared';
import { Visitor, NodePath, transformFileSync } from '@babel/core';
import { cwd } from '../utils';
import { writeFileSync } from 'fs';
import glob from 'glob';

type INode = NodePath['node'];
type ICallExpression = Visitor['CallExpression'];
type IProgram = Visitor['Program'];

const nodeIs = <T extends keyof Visitor>(node: any, type: T): node is Visitor[T] => node.type === type;

export class BabelPlugin {
  @Ovr()
  static createSandboxPlugin(@Opt @SandboxOpt @DropHashOpt opt: ICssSandBoxOption) {
    const { scope, ignoreFiles } = opt;
    const ignoreFilePaths = ignoreFiles ? glob.sync(ignoreFiles, { absolute: true }) : [];

    return function ({ types: t, template: temp }: any): any {
      const shouldIgnore = (state: any) => {
        const filePath = state?.file?.opts?.filename;
        return filePath && ignoreFilePaths.includes(filePath);
      };

      const isMemberExp = (callee: INode, keys: [string, string]) => {
        if (nodeIs(callee, 'MemberExpression')) {
          const first = keys[0] === '*' ? '*' : callee['object']['name'];
          const second = callee['property']['name'];
          const uniqSet = new Set([first, second, ...keys]);
          return uniqSet.size === 2;
        }
        return false;
      };

      let matchedCreateElement = false;
      let matchedSandboxHash = false;

      const handleCallExp: ICallExpression = (path, state) => {
        if (shouldIgnore(state)) return;

        const callee = path.node.callee;
        // 是 document.createElement 的
        if (isMemberExp(callee, ['document', 'createElement'])) {
          matchedCreateElement = true;
          path.node.callee = t.identifier(ReplaceFnStatement);
        }
        // 是 *.____sandboxHash_____ 的
        if (isMemberExp(callee, ['*', SandboxHashId])) {
          matchedSandboxHash = true;
          path.node.callee = t.identifier(SandboxHashId);
        }
      };

      const handleProgram: IProgram = (path, state) => {
        if (shouldIgnore(state)) return;

        const createElementAst = temp(rewrittenFn(scope))();
        const sandboxHashAst = temp(sandboxHash(scope))();
        if (matchedCreateElement) {
          path.pushContainer('body', createElementAst);
        }
        if (matchedSandboxHash) {
          path.pushContainer('body', sandboxHashAst);
        }
      };

      return {
        visitor: {
          Program: { exit: handleProgram },
          CallExpression: { enter: handleCallExp }
        }
      };
    };
  }
}

// const plugin = BabelPlugin.createSandboxPlugin({
//   scope: 'my-sandbox',
//   ignoreFiles: './test copy/**'
// });

// const res = transformFileSync(cwd('./test copy/a.js'), { plugins: [plugin] });
// console.log(res.code);
// writeFileSync(cwd('./test copy/a.js'), res.code);
