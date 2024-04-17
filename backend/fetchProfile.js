// Import necessary modules
import "dotenv/config"; // Load environment variables from a .env file
import fetch from "node-fetch"; // Use node-fetch to make HTTP requests
import { Router } from "express"; // Use the Express Router to define routes

// Create a new router instance
const router = Router();

const API_FOR_PROFILE = `https://api.github.com/users/username`; // API endpoint for fetching profile data
const NO_PROFILE_PIC = `https://avatars.githubusercontent.com/u/68148771?s=400&v=4`; // Default profile picture URL

// Define a route to fetch a user's profile data based on their GitHub username
router.post("/", async (req, res) => {
    // Extract the username from the request body
    const username = req.body.username;
    try {
        // Construct the API URL for fetching profile data using the username
        const apiKeyForFetchingProfileData = API_FOR_PROFILE.replace(
            `username`,
            username
        );
        // Fetch the profile data from the constructed API URL
        const fetchProfileResponse = await fetch(apiKeyForFetchingProfileData);
        // Check if the fetch operation was successful
        if (fetchProfileResponse.ok) {
            // Parse the fetched profile data
            const fetchedProfileData = await fetchProfileResponse.json();
            // Extract relevant data fields from the profile data
            const {
                name,
                avatar_url: profilePic,
                bio,
                location,
                followers,
                following,
                repos_url: reposUrl
            } = fetchedProfileData;
            // Initialize an empty array to store repository information
            const repos = [];
            // Fetch the repositories associated with the user
            const fetchReposResponse = await fetch(reposUrl);
            // Check if fetching repositories was successful
            if (!fetchReposResponse.ok) {
                // If not, return an error response
                res.json(
                    JSON.stringify({
                        statusCode: 0,
                        status: `Something Went Wrong !`
                    })
                );
            } else {
                // Parse the fetched repository data
                const allReposData = await fetchReposResponse.json();
                // If there are repositories, extract relevant information
                if (allReposData.length !== 0) {
                    allReposData.forEach(repo => {
                        const { name, language } = repo;
                        repos.push({ name, language });
                    });
                }
                // Convert the fetched profile data to JSON format
                const fetchedProfileDataJSON = JSON.stringify({
                    username,
                    name,
                    profilePic,
                    bio,
                    location,
                    followers,
                    following,
                    repos
                });
                // Return a success response with the fetched profile data
                res.json(
                    JSON.stringify({
                        statusCode: 1,
                        status: fetchedProfileDataJSON
                    })
                );
            }
        }
        // Handle cases where the username is not found or the request fails
        if (fetchProfileResponse.status === 404)
            res.json(
                JSON.stringify({
                    statusCode: 0,
                    status: `Username Not Found !`
                })
            );

        if (fetchProfileResponse.status !== 404 && !fetchProfileResponse.ok)
            res.json(
                JSON.stringify({
                    statusCode: 0,
                    status: `Something Went Wrong !`
                })
            );
    } catch (error) {
        // Handle any errors that occur during the fetch operation
        console.error(error);
        res.json(
            JSON.stringify({
                statusCode: 0,
                status: `Something Went Wrong !`
            })
        );
    }
});

// Export the router
export default router;
