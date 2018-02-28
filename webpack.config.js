const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(env) {
  env = env || {};
  const isProduction = !!env.prod;

  const webpackConfig = {
    mode: isProduction ? "production" : "development",
    entry: {
      app: "./app/app.ts",
      tests: "./app/tests.js"
    },
    output: {
      path: path.join(__dirname, "/dist")
    },
    resolve: {
      extensions: [".ts", ".js"],
      modules: [__dirname, "node_modules"]
    },
    module: {
      rules: [
        { test: /\.ts$/, loader: "ts-loader" },
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
        template: "app/index.html",
        filename: "index.html",
        chunks: ["app"]
      }),
      new HtmlWebpackPlugin({
        template: "app/tests.html",
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
