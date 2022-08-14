const { concurrent } = require('nps-utils')
const pkg = require('./package.json')
const { name: pkgName } = pkg

const esbuild = (outfile, format = '') =>
  // eslint-disable-next-line max-len
  `esbuild src/index.js --bundle --outfile=${outfile} --platform=node ${format} --banner:js="#!/usr/bin/env node"`

module.exports = {
  scripts: {
    test: {
      script: `jest src/*.spec.js`,
      description: `put the ${pkgName} through its paces`,

      watch: {
        script: `nps "test --watchAll"`,
        description: `re-run tests anytime source files change`,
      },
    },
    lint: {
      description: `lint the source`,
      script: `eslint --fix src/.`,
    },
    build: {
      description: `build the project`,
      esm: {
        description: `build esm output`,
        script: esbuild(pkgName + '.mjs', `--format=esm`),
        watch: {
          description: `rebuild esm output on any changes`,
          script: `nps "build.esm --watch"`,
        },
      },
      cjs: {
        description: `build common js output`,
        script: esbuild(pkgName + '.js'),
        watch: {
          description: `rebuild common js output on any changes`,
          script: `nps "build.cjs --watch"`,
        },
      },
      script: `nps build.esm build.cjs`,
      watch: {
        description: `rebuild outputs anytime source changes`,
        script: concurrent([`"nps build.esm.watch"`, `"nps build.cjs.watch"`]),
      },
    },
  },
}
