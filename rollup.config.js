import RollupTypescript from 'rollup-plugin-typescript2'
import Resolve from '@rollup/plugin-node-resolve';
import Commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import NodePath from 'path'
const resolveFile = path => NodePath.resolve(__dirname, path);
import { terser as Terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'src/browser/index.ts',
		output: [
			{ file: pkg.browser, format: 'es', sourcemap: true }
		],
    plugins: [
      Resolve(),
      Commonjs(),
      RollupTypescript({
        tsconfig: resolveFile('tsconfig.es.json')
      }),
      Terser(),
		]
	}
];
