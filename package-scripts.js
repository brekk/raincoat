const { concurrent } = require('nps-utils')

module.exports = {
  scripts: {
    test: {
      script: `jest src/*.spec.js`,
      description: `put the atacama through its paces`,
      watch: `nps "test -w"`,
    },
    build: {
      description: `build the project`,
      esm: {
        script:
          'esbuild src/index.js --bundle --outfile=atacama.mjs --platform=node --format=esm',
        watch: `nps "build.esm --watch"`,
      },
      cjs: {
        script:
          'esbuild src/index.js --bundle --outfile=atacama.js --platform=node',
        watch: `nps "build.cjs --watch"`,
      },
      script: `nps build.esm build.cjs`,
      watch: concurrent([`"nps build.esm.watch"`, `"nps build.cjs.watch"`]),
    },
  },
}
