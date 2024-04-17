// Import necessary modules
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv/config";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

// Set the global __dirname to the current directory
global.__dirname = path.resolve();

// Check if the NETLIFY_DEPLOY environment variable is set to "true" and set the isProduction flag accordingly
const isProduction = process.env.NETLIFY_DEPLOY === "true" || false;

// Get the NODE_ENV environment variable, defaulting to "development" if undefined
const NODE_ENV = process.env.NODE_ENV || "development";

// Set the default mode to "development"
let mode = "development";

if (isProduction) {
    // If NETLIFY_DEPLOY is "true", set mode to "production"
    mode = "production";
} else {
    // If not in production mode (NETLIFY_DEPLOY is not "true"),
    // check if NODE_ENV is "production" and update the mode accordingly
    if (NODE_ENV === "production") {
        mode = "production";
    }
}

// The mode variable will be set to "production" if either
// NETLIFY_DEPLOY is "true" or NODE_ENV is "production"

// Array to store webpack plugins
const plugins = [
    // Generate HTML file
    new HtmlWebpackPlugin({
        template: "./frontend/index.html",
        filename: "index.html"
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
        filename: "[name].css",
        linkType: "text/css"
    }),
    // Define global constants
    new webpack.DefinePlugin({
        "process.env.API_URL": JSON.stringify(process.env.API_URL)
    })
];

// Add HotModuleReplacementPlugin in development mode
if (NODE_ENV === "development") {
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

// Webpack configuration
export default {
    // Entry point of your JavaScript
    entry: {
        app: "./frontend/js/main.js"
    },
    // Output configuration
    output: {
        // Output directory
        path: path.resolve(__dirname, "build"),
        // Output bundle file name
        filename: "[name].bundle.js",
        // Define the output path for assets
        assetModuleFilename: "images/[name][ext]"
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
                    "css-loader" // Load CSS into the DOM
                ]
            },
            {
                // Process image and font files
                test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
                type: "asset/resource"
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
                                        browsers: [
                                            "last 2 versions",
                                            "not dead",
                                            "not IE <= 11"
                                        ]
                                    }
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    // Development server configuration
    devServer: {
        static: {
            // Set the static directory to serve files from
            directory: path.join(__dirname, "frontend"),
            // Enable watch mode
            watch: true
        },
        // Specify the port for the development server
        port: 8080,
        // Open the default browser when the server starts
        open: true
    },
    // Optimization configuration
    optimization: {
        minimizer: [
            // Minimize CSS
            new CssMinimizerPlugin()
        ]
    },
    // Set the mode based on the environment
    mode
};
