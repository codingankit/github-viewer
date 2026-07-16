// Load environment variables from the .env file
import "dotenv/config";

// Import necessary modules
import express from "express"; // For creating the Express application
import path from "path"; // For working with file paths
import helmet from "helmet"; // For securing HTTP headers

// Import Router for the "/api/fetchProfile" endpoint which is used for fetching profile data
import fetchProfile from "./backend/fetchProfile.js";

// Import Router for the "/api/fetchRepo" endpoint which is used for fetching repository data
import fetchRepo from "./backend/fetchRepo.js";

// Import Router for the "/api/fetchBranches" endpoint which is used for fetching all branches data
import fetchBranches from "./backend/fetchBranches.js";

// Import Router for the "/api/fetchFiles" endpoint which is used for fetching all files and folder in a certain branch of a repo
import fetchFiles from "./backend/fetchFiles.js";

// Set the global __dirname to the current directory
global.__dirname = path.resolve();

// Define the port number to use, defaulting to 3000 if not set in environment variables
const PORT = process.env.PORT || 3000;

// Create an Express application
const app = express();

// Set up Helmet for Express App security, with a Content Security Policy (CSP)
// that allows only the specific external resources this app actually needs —
// tightening security beyond Helmet's defaults while still letting the
// highlight.js CDN, Google Fonts, and GitHub's image/content APIs work
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": [
          "'self'",
          "data:",
          "https://avatars.githubusercontent.com",
          "https://raw.githubusercontent.com",
          "https://github.com",
        ],
        // Allow client-side fetch() calls to GitHub's raw content API,
        // used to pull a file's actual contents for the code viewer
        "connect-src": ["'self'", "https://raw.githubusercontent.com"],
      },
    },
  }),
);

// Parse JSON bodies in requests
app.use(express.json());

// Set up Router for the "/api/fetchProfile" endpoint
app.use("/api/fetchProfile", fetchProfile);

// Set up Router for the "/api/fetchRepo" endpoint
app.use("/api/fetchRepo", fetchRepo);

// Set up Router for the "/api/fetchBranches" endpoint
app.use("/api/fetchBranches", fetchBranches);

// Set up Router for the "/api/fetchFiles" endpoint
app.use("/api/fetchFiles", fetchFiles);

// Path to the build directory for serving static files locally
const views = path.join(__dirname, "build");

// Serves static files locally (on Vercel, static files are served directly by CDN)
app.use(express.static(views));

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(views, "index.html"));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
