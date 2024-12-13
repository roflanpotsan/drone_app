const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["babel-preset-solid", "@babel/preset-env"],
            },
          },
          "ts-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/, // Handle image files
        type: "asset/resource", // Use Webpack's asset/resource module
      },
      {
        test: /\.css$/, // Handle CSS files
        use: ["style-loader", "css-loader"], // Order matters: style-loader first, css-loader second
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 1337,
    historyApiFallback: true, // Enables SPA URL handling
  },
};
