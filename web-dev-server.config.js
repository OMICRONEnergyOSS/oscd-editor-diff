import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  rootDir: 'dist',
  open: 'demo/index.html',
  /** Use regular watch mode if HMR is not enabled. */
  watch: true,
  /** Resolve bare module imports */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development'],
  // },

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    hmrPlugin({
      exclude: ['**/*/node_modules/**/*'],
      presets: [presets.litElement],
    }),
  ],

  // See documentation for all available options
});
