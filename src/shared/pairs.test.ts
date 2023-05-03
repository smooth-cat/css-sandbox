import { IdxArr, LevelMarks, pairs } from './pairs';
describe('IdxArr', () => {
  it('设置指针位置，并获取当前指向元素', () => {
    const arr = new IdxArr(1, 2);
    arr.idx = 1;
    expect(arr.iItem()).toBe(2);
  });
});

describe('LevelMarks', () => {
  const levelMarks = new LevelMarks(new IdxArr(1, 2, 3), new IdxArr(4, 5, 6));

  it('遍历矩阵', () => {
    const orderArr: any[] = [];
    const levelArr = new Set<number>();
    levelMarks.loop((item, level) => {
      orderArr.push(item);
      levelArr.add(level);
    });

    expect(orderArr).toEqual([1, 2, 3, 4, 5, 6]);
    expect(Array.from(levelArr)).toEqual([0, 1]);
  });
});

describe('pairs', () => {
  it('确认参数', () => {
    const str = '0${3${6}8}A';
    pairs({
      str,
      startReg: /(\$)\{/,
      endReg: /\}/,
      replacer: ({ startMatch, endMatch, content, replacedContent, replacedMatch }) => {
        // 匹配内层括号对，这里因为是一个父子嵌套就做简单判断
        if (startMatch.left !== 1) {
          // 原来的内容 ${6} 替换成 ${@};
          return `\${@}`;
        }
        // 匹配外层括号对
        // 所有的位置关系都是相对于原字符串而言的
        /*----------------- 左标识符 -----------------*/
        expect(startMatch.left).toBe(1);
        // 左右边界与 slice 的定义相同 左闭右开
        expect(startMatch.right).toBe(3);
        expect(startMatch.match).toBe('${');
        // 匹配 startReg 中的 (\$) 子项
        expect(startMatch.subMatches).toEqual(['$']);

        /*----------------- 右标识符 -----------------*/
        expect(endMatch.left).toBe(9);
        expect(endMatch.right).toBe(10);
        expect(endMatch.match).toBe('}');
        expect(endMatch.subMatches).toEqual([]);

        /*----------------- 内容 -----------------*/
        expect(content.left).toBe(3);
        expect(content.right).toBe(9);
        expect(content.match).toBe('3${6}8');

        /*----------------- 由内部 replacer 替换后的内容 -----------------*/
        expect(replacedContent).toBe('3${@}8');
        expect(replacedMatch).toBe('${3${@}8}');
      }
    });
  });

  it('将 ${}对 替换成 ()对', () => {
    const str = '0${3${6}8}A';
    const pair = pairs({
      str,
      startReg: /(\$)\{/,
      endReg: /\}/,
      // 如果是最内层的括号对 replacedContent === content.match
      replacer: ({ replacedContent, content }) => {
        return `(${replacedContent})`;
      }
    });
    expect(pair.getReplaced()).toBe('0(3(6)8)A');
  });

  it('只替换内层的括号对', () => {
    const str = '0${3${6}8}A';
    const pair = pairs({
      str,
      startReg: /(\$)\{/,
      endReg: /\}/,
      // 如果是最内层的括号对 replacedContent === content.match
      replacer: ({ startMatch, replacedContent }) => {
        // 匹配到外层时返回 undefined，内层的替换仍然会生效，
        if (startMatch.left === 1) {
          return;
          // 除非外层手动返回原始内容，内层的替换才作废
          // return `${startMatch.match}${content.match}${endMatch.match}`
        }
        return `(${replacedContent})`;
      }
    });
    expect(pair.getReplaced()).toBe('0${3(6)8}A');
  });

  it('获取所有大括号对的位置', () => {
    // 括号对位置分别是 1,4,5,7,9,10,11,13，收集顺序是由内到外，同级从前到后
    const str = '0{23{}6{8{}}C}';
    const expectPlaces = [1, 4, 5, 7, 9, 10, 11, 13];
    const collector: number[] = [];
    pairs({
      str,
      startReg: /\{/,
      endReg: /\}/,
      replacer: ({ startMatch, endMatch }) => {
        collector.push(startMatch.left, endMatch.left);
      }
    });
    expect(collector.sort((a, b) => a - b)).toEqual(expectPlaces);
  });

  it('收集顺序', () => {
    // 括号对位置分别是 1,4,5,7,9,10,11,13，
    const str = '0{23{}6{8{}}C}';
    // 收集顺序是同级从前到后，非同级由内至外
    const expectCollectOrder = [4, 5, /**/ 9, 10, /**/ 7, 11, /**/ 1, 13];
    const collector: number[] = [];
    pairs({
      str,
      startReg: /\{/,
      endReg: /\}/,
      replacer: ({ startMatch, endMatch }) => {
        collector.push(startMatch.left, endMatch.left);
      }
    });
    expect(collector).toEqual(expectCollectOrder);
  });

  it('参数非字符串', () => {
    const pair = pairs({
      str: undefined as any,
      startReg: /\{/,
      endReg: /\}/,
    })
    expect(pair.getReplaced()).toBe(undefined)
  })

});

// TODO: 补充原子方法的单测
