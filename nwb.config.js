module.exports = {
  type: "web-module",
  npm: {
    esModules: true,
    umd: {
      global: "tox",
      externals: {},
    },
  },
  babel: {
    presets: ["@babel/preset-env", "@babel/preset-flow"],
    plugins: [],
  },
};
