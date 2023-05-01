console.warn = jest.fn();

jest.mock('fs', () => {
  const { readdirSync, readFileSync } = jest.requireActual('fs');
  const { resolve } = jest.requireActual('path');
  const { fs: memfs } = jest.requireActual('memfs');
  const testDir = resolve(process.cwd(), './test');
  const names = readdirSync(testDir);
  globalThis['fileList'] = names.map(name => {
    const content = readFileSync(resolve(testDir, name), 'utf-8');
    return {
      name,
      content
    };
  });

  return memfs;
});

jest.mock('../src/shared/utils.ts', () => {
  const raw = jest.requireActual('../src/shared/utils.ts');

  return {
    ...raw,
    createHash: (len: string) => {
      return '12345678';
    }
  };
});
