export type ILoopTreeProps<T, K> = {
  list: T[];
  children?: K|K[];
  stack?: number[];
  enter?: (node: T, i: number, list: T[], stack: number[]) => boolean | void;
  leave?: (node: T, i: number, list: T[], stack: number[]) => boolean | void;
};

function getChildren(item: any = {}, keys: string|string[]) {
  if(typeof keys === 'string') {
    return item[keys]
  }
  for (let i = 0; i < keys.length; i++) {
    const val = item[keys[i]];
    if(val?.length) {
      return val;
    }
  }
}

export function loopTree<T extends Record<string, any>, K extends keyof T>({
  list,
  children = 'children' as K,
  stack = [],
  enter,
  leave,
}: ILoopTreeProps<T, K>): boolean | void {
  

  for (let i = list.length - 1; i >= 0; i--) {
    stack.push(i);
    let res = enter?.(list[i], i, list, stack);

    const hasRes = () => res === true;

    if (hasRes()) {
      stack.pop();
      return res;
    }

    const subList = getChildren(list?.[i], children as string)  || null;

    if (subList) {
      res = loopTree({ list: subList, children, stack, enter, leave });
    }

    const leaveRes = leave?.(list[i], i, list, stack);
    res = hasRes() ? res : leaveRes;

    stack.pop();
    // 彻底中断
    if (hasRes()) {
      return res;
    }
  }
}

// const a = [
//   {
//     name: '123',
//     c: [
//       {
//         name: '123-1',
//       },
//       {
//         name: '123-2',
//         c: [
//           {
//             name: '123-2-1',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: '456',
//     c: [],
//   },
//   {
//     name: '789',
//     c: [
//       {
//         name: '789-1',
//       },
//       {
//         name: '789-2',
//       },
//     ],
//   },
// ];

// loopTree({
//   list: a,
//   children: 'c',
//   // enter(node) {
//   //   console.log(node.name);
//   // },
//   leave(node) {
//     console.log(node.name);
//   }
// });
