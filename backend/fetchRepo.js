// Import necessary modules
import "dotenv/config"; // Load environment variables from a .env file
import fetch from "node-fetch"; // Use node-fetch to make HTTP requests
import { Router } from "express"; // Use the Express Router to define routes

// Create a new router instance
const router = Router();

const API_FOR_REPO = `https://api.github.com/repos/username/repoName`; // API endpoint for fetching repository data

// This line fetches the GitHub API token from the environment variables
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

// Define a route to fetch a user's repository data based on their GitHub username and repository name
router.post("/", async (req, res) => {
    // Extract the username and repoName from the request body
    const { username, repoName } = req.body;
    const replacements = { username, repoName };

    try {
        // Construct the API URL for fetching repository data using the username and repository name
        const apiKeyForFetchingRepoData = API_FOR_REPO.replace(
            /\b(?:username|repoName)\b/gi,
            match => replacements[match]
        );

        // Fetch the repository data from the GitHub API
        const fetchRepoResponse = await fetch(apiKeyForFetchingRepoData, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${GITHUB_API_TOKEN}`
            }
        });

        // Check if the fetch operation was successful
        if (fetchRepoResponse.ok) {
            // Parse the fetched repository data
            const fetchedRepoData = await fetchRepoResponse.json();
            const {
                description,
                languages_url: languagesUrl,
                default_branch: defaultBranch
            } = fetchedRepoData;

            // Fetch the repository languages
            const fetchedRepoLanguages = await fetch(languagesUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${GITHUB_API_TOKEN}`
                }
            }).then(res => res.json());
            const repoTotalLinesOfCode = Object.values(
                fetchedRepoLanguages
            ).reduce((acc, value) => acc + value, 0);
            const repoLanguages = Object.entries(fetchedRepoLanguages).map(
                ([name, lines]) => ({
                    name,
                    percentage: ((lines / repoTotalLinesOfCode) * 100).toFixed(
                        1
                    )
                })
            );

            // Return a success response with the fetched repository data
            res.json({
                statusCode: 1,
                status: {
                    description,
                    repoLanguages,
                    defaultBranch
                }
            });
        } else {
            // Handle cases where the repository is not found or the request fails
            const errorMessage =
                fetchRepoResponse.status === 404
                    ? "Repository Not Found!"
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
