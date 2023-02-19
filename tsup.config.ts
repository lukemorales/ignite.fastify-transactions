// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src', '!src/**/*.spec.ts'],
  clean: true,
  sourcemap: true,
});
