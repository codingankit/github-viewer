// Import necessary modules
import "dotenv/config"; // Load environment variables from a .env file
import fetch from "node-fetch"; // Use node-fetch to make HTTP requests
import { Router } from "express"; // Use the Express Router to define routes

// Create a new router instance
const router = Router();

const API_FOR_PROFILE = `https://api.github.com/users/username`; // API endpoint for fetching profile data

// This line fetches the GitHub API token from the environment variables
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

const NO_PROFILE_PIC = `https://avatars.githubusercontent.com/u/68148771?s=400&v=4`; // Default profile picture URL

// Define a route to fetch a user's profile data based on their GitHub username
router.post("/", async (req, res) => {
    // Extract the username from the request body
    const { username } = req.body;

    try {
        // Construct the API URL for fetching profile data using the username
        const apiKeyForFetchingProfileData = API_FOR_PROFILE.replace(
            "username",
            username
        );

        // Fetch the profile data from the GitHub API
        const fetchProfileResponse = await fetch(apiKeyForFetchingProfileData, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${GITHUB_API_TOKEN}`
            }
        });

        // Check if the fetch operation was successful
        if (fetchProfileResponse.ok) {
            // Parse the fetched profile data
            const fetchedProfileData = await fetchProfileResponse.json();
            const {
                name,
                avatar_url: profilePic,
                bio,
                location,
                followers,
                following,
                repos_url: reposUrl
            } = fetchedProfileData;

            // Fetch the repositories associated with the user
            const fetchReposResponse = await fetch(reposUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${GITHUB_API_TOKEN}`
                }
            });

            if (!fetchReposResponse.ok) {
                // Handle failed repository fetch
                res.json({ statusCode: 0, status: "Something Went Wrong!" });
                return;
            }

            // Parse the fetched repository data
            const allReposData = await fetchReposResponse.json();
            const repos = allReposData.map(({ name, language }) => ({
                name,
                language
            }));

            // Return a success response with the fetched profile data
            res.json({
                statusCode: 1,
                status: {
                    username,
                    name,
                    profilePic,
                    bio,
                    location,
                    followers,
                    following,
                    repos
                }
            });
        } else {
            // Handle cases where the username is not found or the request fails
            const errorMessage =
                fetchProfileResponse.status === 404
                    ? "Username Not Found!"
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
