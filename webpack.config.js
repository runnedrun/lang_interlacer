const path = require("path")
const nodeExternals = require("webpack-node-externals")

console.log("mode", process.env.WEBPACK_MODE)
module.exports = {
  mode: process.env.WEBPACK_MODE || "development",
  entry: "./functions/src/index",
  target: "node",
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-transform-runtime",
          ],
        },
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: ["css-loader", "postcss-loader"],
      },
      {
        test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        exclude: /node_modules/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  externals: [nodeExternals()],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "this", // <-- Important
  },
}
