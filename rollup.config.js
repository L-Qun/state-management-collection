const createBabelConfig = require("./babel.config.js");
const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const babelPlugin = require("@rollup/plugin-babel");
const commonjs = require("@rollup/plugin-commonjs");

const extensions = [".ts", ".tsx"];

function getBabelOptions() {
  return {
    ...createBabelConfig,
    extensions,
    babelHelpers: "bundled",
    comments: false,
  };
}

function createDeclarationConfig(input, output) {
  return {
    input: `${input}/src/index.ts`,
    output: {
      dir: output,
    },
    plugins: [
      typescript({
        declaration: true,
        emitDeclarationOnly: true,
        outDir: output,
        tsconfig: `${input}/tsconfig.json`,
      }),
    ],
  };
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: "esm" },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: "cjs" },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  };
}

function createUMDConfig(input, output, name) {
  return {
    input,
    output: { file: output, format: "umd", name },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  };
}

module.exports = (args) => {
  const packageName = args.package;

  const input = `packages/${packageName}`;
  const output = `packages/${packageName}/dist`;

  return [
    createDeclarationConfig(input, output),
    createESMConfig(`${input}/src/index.ts`, `${output}/index.ems.js`),
    createCommonJSConfig(`${input}/src/index.ts`, `${output}/index.cjs.js`),
    createUMDConfig(
      `${input}/src/index.ts`,
      `${output}/index.umd.js`,
      packageName,
    ),
  ];
};
