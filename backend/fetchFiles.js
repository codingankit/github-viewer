// Import necessary modules
import "dotenv/config"; // Load environment variables from a .env file
import fetch from "node-fetch"; // Use node-fetch to make HTTP requests
import { Router } from "express"; // Use the Express Router to define routes

// Create a new router instance
const router = Router();

// Define the base API endpoint for fetching repository contents
const API_FOR_FILES = `https://api.github.com/repos/username/repoName/contents/`;

// Fetch the GitHub API token from the environment variables
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

// Define a route to fetch files based on GitHub username, repository name, path, and branch
router.post("/", async (req, res) => {
    // Extract the required information from the request body
    const { username, repoName, path, currentBranchForRepo } = req.body;

    try {
        // Replace placeholders in API_FOR_FILES with actual username and repoName
        const replacements = { username, repoName };
        let apiKeyForFetchingFiles = API_FOR_FILES.replace(
            /\b(?:username|repoName)\b/gi,
            match => replacements[match]
        );

        // Append path and branch information to the API endpoint
        if (path) {
            apiKeyForFetchingFiles += path;
        }
        apiKeyForFetchingFiles += `?ref=${currentBranchForRepo}`;

        // Fetch files from the GitHub API
        const fetchedFilesResponse = await fetch(apiKeyForFetchingFiles, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${GITHUB_API_TOKEN}`
            }
        });

        // Process the fetched files and send the response
        if (fetchedFilesResponse.ok) {
            const fetchedFiles = await fetchedFilesResponse.json();
            const files = fetchedFiles.map(({ name, type, path, download_url: downloadUrl }) => ({
                name,
                path,
                type,
                downloadUrl
            }));

            res.json({ statusCode: 1, status: files });
        } else {
            // Handle error response from the GitHub API
            const errorMessage =
                fetchedFilesResponse.status === 404
                    ? "Files Not Found!"
                    : "Something Went Wrong!";
            res.json({ statusCode: 0, status: errorMessage });
        }
    } catch (error) {
        // Handle any errors that occur during the fetch operation
        console.error(error);
        res.json({ statusCode: 0, status: "Something Went Wrong!" });
    }
});

// Export the router
export default router;
