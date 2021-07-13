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
    plugins: [
      ["@babel/plugin-proposal-private-methods", { loose: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
    ],
  },
};
