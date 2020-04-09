module.exports = (config) =>
  config.set({
    logLevel: config.LOG_WARN,
    singleRun: true,
    reporters: ["mocha"],
    browsers: ["ChromeHeadless"],
    frameworks: ["jasmine"],
    files: [{ pattern: "__tests__/**/*.test.js", watched: false }],
    preprocessors: {
      "./__tests__/**/*.test.js": ["rollup"],
    },
    rollupPreprocessor: {
      output: {
        format: "iife",
        sourcemap: "inline",
      },
    },
  });
