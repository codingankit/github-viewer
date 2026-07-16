// Import necessary modules
import "dotenv/config"; // Load environment variables from a .env file
import fetch from "node-fetch"; // Use node-fetch to make HTTP requests
import { Router } from "express"; // Use the Express Router to define routes

// Create a new router instance
const router = Router();

const API_FOR_BRANCHES = `https://api.github.com/repos/username/repoName/branches`; // API endpoint for fetching repository branches

// This line fetches the GitHub API token from the environment variables
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

// Define a route to fetch branches based on GitHub username and repository name
router.post("/", async (req, res) => {
    // Extract the username and repoName from the request body
    const { username, repoName } = req.body;

    try {
        // Construct the API URL for fetching branches data
        const apiKeyForFetchingBranchesData = API_FOR_BRANCHES.replace(
            /\b(?:username|repoName)\b/gi,
            match => ({ username, repoName })[match]
        );

        // Fetch the branches data from the GitHub API
        const fetchBranchesResponse = await fetch(
            apiKeyForFetchingBranchesData,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${GITHUB_API_TOKEN}`
                }
            }
        );

        if (fetchBranchesResponse.ok) {
            // Parse the fetched branches data and map to branch names
            const branches = (await fetchBranchesResponse.json()).map(
                branch => branch.name
            );

            // Return a success response with the fetched branches data
            res.json({ statusCode: 1, status: branches });
        } else {
            // Handle cases where the branches are not found or the request fails
            const errorMessage =
                fetchBranchesResponse.status === 404
                    ? "Branches Not Found!"
                    : "Something Went Wrong!";
            res.json({ statusCode: 0, status: errorMessage });
        }
    } catch (error) {
        // Handle any errors that occur during the fetch operation
        res.json({ statusCode: 0, status: "Something Went Wrong!" });
        console.error(error);
    }
});

// Export the router
export default router;
