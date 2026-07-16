// Import necessary modules
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
// Loads environment variables from .env file into process.env
import dotenv from "dotenv/config";

// Set the global __dirname to the current directory
global.__dirname = path.resolve();

// Set mode to "production" if NODE_ENV is "production", otherwise default to "development"
const mode = process.env.NODE_ENV || "development";

// Set dev server port
const devPort = process.env.DEV_PORT || 8080;

// Array to store webpack plugins
const plugins = [
  // Generate HTML file
  new HtmlWebpackPlugin({
    template: "./frontend/index.html",
    filename: "index.html",
  }),
  // Extract CSS into separate files
  new MiniCssExtractPlugin({
    filename: "[name].css",
    linkType: "text/css",
  }),
];

// Add HotModuleReplacementPlugin in development mode
if (mode === "development") {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

// Webpack configuration
export default {
  // Entry point of your JavaScript
  entry: {
    app: "./frontend/main.js",
  },
  // Output configuration
  output: {
    // Output directory
    path: path.resolve(__dirname, "build"),
    // Output bundle file name
    filename: "[name].bundle.js",
    // Define the output path for assets
    assetModuleFilename: "images/[name][ext]",
  },
  // Plugins configuration
  plugins,
  // Module rules for processing different file types
  module: {
    rules: [
      {
        // Process CSS files
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS into separate files
          "css-loader", // Load CSS into the DOM
        ],
      },
      {
        // Process image and font files
        test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
        type: "asset/resource",
      },
      {
        // Process JavaScript files using Babel
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 versions", "not dead", "not IE <= 11"],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  // Development server configuration
  devServer: {
    static: {
      // Set the static directory to serve files from
      directory: path.join(__dirname, "frontend"),
      // Enable watch mode
      watch: true,
    },
    // Specify the port for the development server
    port: devPort,
    // Open the default browser when the server starts
    open: true,
    // Proxy API requests to the backend server
    proxy: [
      {
        context: ["/api"],
        target: `http://localhost:${process.env.PORT || 3000}`,
        changeOrigin: true,
      },
    ],
  },
  // Optimization configuration
  optimization: {
    minimizer: [
      // "..." tells webpack to keep its default minimizers (Terser for JS)
      // instead of replacing them — without this, only CSS gets minified
      "...",
      // Minimize CSS
      new CssMinimizerPlugin(),
    ],
  },
  // Set the mode based on the environment
  mode,
};
