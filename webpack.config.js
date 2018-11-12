const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

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
      modules: ["./src", "node_modules"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            compilerOptions: {
              target: isProduction ? "es5" : "es2017"
            }
          }
        },
        { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
        { test: /\.less$/, loaders: ["style-loader", "css-loader", "less-loader"] },
        { test: /\.scss$/, loaders: ["style-loader", "css-loader", "sass-loader"] },
        { test: /\.sass$/, loaders: ["style-loader", "css-loader", "sass-loader"] },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff)$/,
          loader: "url-loader",
          options: { limit: 20000 }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        chunks: ["app"]
      }),
      new HtmlWebpackPlugin({
        template: "./src/tests.html",
        filename: "tests.html"
      }),
      false &&
        new BundleAnalyzerPlugin({
          // Can be `server`, `static` or `disabled`.
          // In `server` mode analyzer will start HTTP server to show bundle report.
          // In `static` mode single HTML file with bundle report will be generated.
          // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
          analyzerMode: "static",
          // Path to bundle report file that will be generated in `static` mode.
          // Relative to bundles output directory.
          reportFilename: "dist/bundle-analyzer-app-report.html",
          // Automatically open report in default browser
          openAnalyzer: true,
          // If `true`, Webpack Stats JSON file will be generated in bundles output directory
          generateStatsFile: false,
          // Log level. Can be 'info', 'warn', 'error' or 'silent'.
          logLevel: "info"
        })
    ].filter(x => x),
    devtool: isProduction ? false : "eval-source-map",
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      port: 10001
    }
  };
  return webpackConfig;
};
