declare module 'roughjs/bundled/rough.cjs.js' {
  import type rough from 'roughjs/bin/rough';
  const mod: typeof rough & {default?: typeof rough};
  export default mod;
}
