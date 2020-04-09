import { terser } from "rollup-plugin-terser";

const config = {
  input: "./src/index.js",
  output: {
    file: "./dist/simple-drawing-board.js",
    format: "umd",
    name: "SimpleDrawingBoard",
  },
};

const minConfig = JSON.parse(JSON.stringify(config));
minConfig.output.file = "./dist/simple-drawing-board.min.js";
minConfig.plugins = [terser()];

export default [config, minConfig];
