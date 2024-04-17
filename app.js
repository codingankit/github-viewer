// Load environment variables from the .env file
import "dotenv/config";

// Import necessary modules
import express from "express"; // For creating the Express application
import path from "path"; // For working with file paths
import cors from "cors"; // For enabling CORS (Cross-Origin Resource Sharing)
import helmet from "helmet"; // For securing HTTP headers

// Import Router for the "/api/fetchProfile" endpoint which is used for fetching profile data
import fetchProfile from "./backend/fetchProfile.js";

// Set the global __dirname to the current directory
global.__dirname = path.resolve();

// Define the port number to use, defaulting to 3000 if not set in environment variables
const PORT = process.env.PORT || 3000;

// Check if the NODE_ENV environment variable is set to "production"
// If it is "production", set isProduction to true
// If NODE_ENV is undefined or not "production", set isProduction to false
const isProduction = process.env.NODE_ENV === "production" || false;

// Get the allowed origin from the environment variables and convert it to uppercase
const ACCESS_CONTROL_ALLOW_ORIGIN = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;

// Create an Express application
const app = express();

// Set up Helmet for Express App security
app.use(helmet());

// Set up CORS middleware with a specific allowed origin
app.use(
    cors({
        origin: ACCESS_CONTROL_ALLOW_ORIGIN
    })
);

// Parse JSON bodies in requests
app.use(express.json());

// Set up Router for the "/api/fetchProfile" endpoint
app.use("/api/fetchProfile", fetchProfile);

// If the server is in production mode
if (isProduction) {
    // Define the path to the static files (served from the 'build' directory)
    const views = path.join(__dirname, "build");

    // Serve static files from the 'build' directory
    app.use(express.static(views));

    // Route for the homepage
    app.get("/", (req, res) => {
        res.sendFile(path.join(views, "index.html"));
    });
}

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
