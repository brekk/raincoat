const { concurrent } = require('nps-utils')
const pkg = require('./package.json')
const { name: pkgName } = pkg

module.exports = {
  scripts: {
    test: {
      script: `jest src/*.spec.js`,
      description: `put the ${pkgName} through its paces`,

      watch: {
        script: `nps "test -w"`,
        description: `re-run tests anytime source files change`,
      },
    },
    build: {
      description: `build the project`,
      esm: {
        description: `build esm output`,
        script: `esbuild src/index.js --bundle --outfile=${pkgName}.mjs --platform=node --format=esm`,
        watch: {
          description: `rebuild esm output on any changes`,
          script: `nps "build.esm --watch"`,
        },
      },
      cjs: {
        description: `build common js output`,
        script: `esbuild src/index.js --bundle --outfile=${pkgName}.js --platform=node`,
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
