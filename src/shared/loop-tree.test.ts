import { getChildren, loopTree } from './loop-tree';

// 共 8 个节点
const list = [
  {
    name: '123',
    c: [
      {
        name: '123-1'
      },
      // 123-2 index =1，list = list[0].c， stack [0,1]
      {
        name: '123-2',
        c: [
          {
            name: '123-2-1'
          }
        ]
      }
    ]
  },
  {
    name: '456',
    c: []
  },
  {
    name: '789',
    c: [
      {
        name: '789-1'
      },
      {
        name: '789-2'
      }
    ]
  }
];

const treeNode = {
  children: []
};
const departmentNode = {
  departMents: ['foo'],
  staffs: ['bar']
};

describe('getChildren', () => {
  it('获取单 key 的子节点遍历', () => {
    expect(getChildren(treeNode, 'children')).toBeDefined();
  });

  it('多 key 的子节点遍历', () => {
    expect(getChildren(departmentNode, ['departMents', 'staffs'])).toEqual(['foo']);
    expect(getChildren(departmentNode, ['staffs', 'departMents'])).toEqual(['bar']);
  });
});

describe('loopTree', () => {
  it('遍历次数统计', () => {
    const mockEnter = jest.fn();
    const mockLeave = jest.fn();
    loopTree({ list, children: 'c', enter: mockEnter, leave: mockLeave });
    expect(mockEnter).toBeCalledTimes(8);
    expect(mockLeave).toBeCalledTimes(8);
  });

  it('遍历入参确认', () => {
    loopTree({
      list,
      children: 'c',
      enter: (node, i, pList, stack) => {
        // 123-2 index =1，pList = list[0].c， stack [0,1]
        if (node.name === '123-2') {
          expect(i).toBe(1);
          expect(pList).toBe(list[0].c);
          expect(stack).toEqual([0, 1]);
        }
      }
    });
  });

  it('enter 时中断遍历', () => {
    const mockEnter = jest.fn();
    const mockLeave = jest.fn();
    loopTree({
      list,
      children: 'c',
      enter: node => {
        mockEnter();
        // 123-2 index =1，pList = list[0].c， stack [0,1]
        if (node.name === '123-2') {
          return true;
        }
      },
      leave: mockLeave
    });
    expect(mockEnter).toBeCalledTimes(6);
    expect(mockLeave).toBeCalledTimes(5);
  });

  it('leave 时中断遍历', () => {
    const mockEnter = jest.fn();
    const mockLeave = jest.fn();
    loopTree({
      list,
      children: 'c',
      enter: mockEnter,
      leave: node => {
        mockLeave();
        // 123-2 index =1，pList = list[0].c， stack [0,1]
        if (node.name === '123-2') {
          return true;
        }
      }
    });
    // leave时才中断，所以内部的唯一节点也完成了遍历
    expect(mockEnter).toBeCalledTimes(7);
    expect(mockLeave).toBeCalledTimes(7);
  });
});
