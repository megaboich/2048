const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(env) {
  env = env || {};
  const isProduction = !!env.prod;

  const webpackConfig = {
    mode: isProduction ? "production" : "development",
    entry: {
      app: "./src/app.ts",
      tests: "./src/tests.js"
    },
    output: {
      path: path.join(__dirname, "/dist")
    },
    resolve: {
      extensions: [".ts", ".js"],
      modules: [path.join(__dirname, "/src"), "node_modules"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "awesome-typescript-loader",
          options: {
            target: isProduction ? "es5" : "es2017"
          }
        },
        { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff)$/,
          loader: "url-loader",
          options: { limit: 20000 }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/index.html",
        filename: "index.html",
        chunks: ["app"]
      }),
      new HtmlWebpackPlugin({
        template: "src/tests.html",
        filename: "tests.html"
      })
    ],
    devtool: isProduction ? false : "eval-source-map",
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      port: 10001
    }
  };
  return webpackConfig;
};
