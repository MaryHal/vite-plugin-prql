import { defineConfig } from 'vitest/config'

import prqlPlugin from './src/index'

export default defineConfig({
  plugins: [prqlPlugin()],
})
