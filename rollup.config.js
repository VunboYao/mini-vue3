import typescript from '@rollup/plugin-typescript'
import Package from './package.json'
export default {
  input: './src/index.ts',
  output: [
    // 1. cjs => commonjs
    // 2. esm => esModule
    {
      format: 'cjs',
      file: Package.main,
    },
    {
      format: 'es',
      file: Package.module,
    },
  ],
  plugins: [typescript()],
}
