// Dynamically import the CSS file
import "../css/style.css";

// Variables for HTML elements
const wrapper = document.getElementById("wrapper");
const searchUserInput = document.getElementById("searchUserInput");
const profileFullView = document.getElementById("profileFullView");
const profilePicImg = document.getElementById("profilePic");
const userFullNameText = document.getElementById("userFullName");
const usernameText = document.getElementById("username");
const userBioText = document.getElementById("userBio");
const locationDiv = document.getElementById("locationDiv");
const locationText = document.getElementById("location");
const followersText = document.getElementById("followers");
const followingText = document.getElementById("following");
const totalReposBadge = document.getElementById("totalReposBadge");
const reposContainer = document.getElementById("reposContainer");
const loaderDivForGeneral = document.getElementById("loaderDivForGeneral");
const infoDiv = document.getElementById("infoDiv");
const infoText = document.getElementById("infoText");
const header = document.getElementById("header");
const btn = document.getElementById("submit");

// API URL
const API_URL = process.env.API_URL;

/**
 * Utility class with helper methods.
 */
class UtilityToolkit {
    /**
     * Formats a number with suffixes (k, M, B, T) for readability.
     * @param {number} number - The number to format.
     * @returns {string} - The formatted number with suffix.
     */
    static formatNumber(number) {
        const suffixes = [``, `k`, `M`, `B`, `T`];
        // Calculate the number of digits in the number and determine the suffix
        const suffixNum = Math.floor((`` + number).length / 3);
        // Calculate the shortened number based on the suffix
        let shortNumber = parseFloat(
            (suffixNum != 0
                ? number / Math.pow(1000, suffixNum)
                : number
            ).toPrecision(2)
        );
        // If the shortened number has decimal places, round it to one decimal place
        if (shortNumber % 1 !== 0) {
            shortNumber = shortNumber.toFixed(1);
        }
        // Return the formatted number with the appropriate suffix
        return shortNumber + suffixes[suffixNum];
    }

    /**
     * Resets the profile view to its initial state.
     */
    static resetProfile() {
        loaderDivForGeneral.style.display = `none`;
        profileFullView.style.display = `none`;
        profileFullView.style.display = `none`;
        infoDiv.style.display = `none`;
        followingText.innerText = ``;
        followersText.innerText = ``;
        userBioText.innerText = ``;
        locationText.innerText = ``;
        profilePicImg.removeAttribute(`src`);
        userFullNameText.style.display = `block`;
        usernameText.style.fontSize = `14px`;
        userFullNameText.innerText = ``;
        usernameText.innerText = ``;
        totalReposBadge.innerText = `0`;
        reposContainer.innerHTML = ``;
    }
}

/**
 * Utility class for displaying information messages.
 */
class Show {
    /**
     * Displays an information message.
     * @param {string} type - The type of message (e.g., 'info', 'err').
     * @param {string} msg - The message to display.
     */
    static info(type, msg) {
        // Hide the loader and main content, and display the info message
        loaderDivForGeneral.style.display = `none`;
        profileFullView.style.display = `none`;
        infoDiv.style.display = `block`;
        // Set the class name for styling based on the message type
        infoText.className = ``;
        infoText.className = type;
        // Set the text of the info message
        infoText.innerText = msg;
    }
}

/**
 * Profile class for fetching and displaying user profile information.
 */
class Profile {
    /**
     * Fetches a user's profile data from the API.
     * @param {string} username - The GitHub username to fetch.
     * @returns {Promise<object>} - The user's profile data.
     */
    static async fetch(username) {
        try {
            // Construct the API URL for fetching the profile data
            const apiForFetchProfile = `${API_URL}/api/fetchProfile`;

            // Fetch the user's profile data from the API
            const fetchedProfileRaw = await fetch(apiForFetchProfile, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });

            // Parse the fetched profile data
            const fetchedProfile = JSON.parse(await fetchedProfileRaw.json());

            // Check if the API call was successful
            if (fetchedProfile.statusCode === 0) {
                // Display an error message if the API call failed
                Show.info(`err`, fetchedProfile.status);
            } else {
                // Return the user's profile data if the API call was successful
                return JSON.parse(fetchedProfile.status);
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.log(error);
            // Display an error message if something went wrong
            Show.info(`err`, `Something Went Wrong!`);
        }
    }

    /**
     * Displays the user's profile information on the page.
     * @param {object} profileData - The user's profile data to display.
     */
    static show({
        username,
        name,
        profilePic,
        bio,
        location,
        followers,
        following,
        repos
    }) {
        // Reset the profile view to ensure a clean display
        UtilityToolkit.resetProfile();

        // Display the number of followers and following with formatted numbers
        followingText.innerText = UtilityToolkit.formatNumber(following);
        followersText.innerText = UtilityToolkit.formatNumber(followers);

        // Display the user's bio if available
        if (bio) userBioText.innerText = bio;

        // Display the user's location if available, hide the location section otherwise
        if (!location) locationDiv.style.display = `none`;
        locationText.innerText = location;

        // Display the user's profile picture
        if (!profilePic) profilePicImg.setAttribute(`src`, noProfilePic);
        profilePicImg.setAttribute(`src`, profilePic);

        // Display the user's full name and username
        if (!name) {
            userFullNameText.style.display = `none`;
            usernameText.innerText = `@${username}`;
            usernameText.style.fontSize = `23px`;
        } else {
            userFullNameText.innerText = name;
            usernameText.innerText = `@${username}`;
        }

        // Display the total number of repositories and each repository's details
        if (repos.length !== 0) {
            totalReposBadge.innerText = UtilityToolkit.formatNumber(
                repos.length
            );
            repos.forEach(repo => {
                const repoDiv = document.createElement(`div`);
                const repoNameDiv = document.createElement(`div`);
                const repoName = document.createElement(`div`);
                const repoBadge = document.createElement(`div`);
                const repoLang = document.createElement(`div`);
                repoDiv.classList.add(`repo`);
                repoNameDiv.classList.add(`repoNameDiv`);
                repoName.classList.add(`repoName`);
                repoBadge.classList.add(`repoBadge`);
                repoLang.classList.add(`repoLang`);
                repoName.innerText = repo.name;
                repoBadge.innerText = `Public`;
                repoLang.innerText = repo.language;
                repoNameDiv.append(repoName, repoBadge);
                if (!repo.language) {
                    repoDiv.append(repoNameDiv);
                } else {
                    repoDiv.append(repoNameDiv, repoLang);
                }
                reposContainer.append(repoDiv);
            });
        } else {
            totalReposBadge.innerText = 0;
        }

        // Hide the loader and info div, display the main content and profile view
        loaderDivForGeneral.style.display = `none`;
        infoDiv.style.display = `none`;
        profileFullView.style.display = `block`;
        profileFullView.style.display = `block`;
    }
}

// Event listener for the search input to fetch user profile on Enter key press
searchUserInput.addEventListener(`keydown`, async e => {
    // Check if the Enter key was pressed
    if (e.keyCode === 13) {
        // Get the value of the input field and trim any whitespace
        const userForSearch = searchUserInput.value;
        // Check if the input field is not empty
        if (userForSearch.trim() !== ``) {
            // Hide main content and info div, display loader
            profileFullView.style.display = `none`;
            infoDiv.style.display = `none`;
            loaderDivForGeneral.style.display = `block`;
            // Blur the input field
            searchUserInput.blur();
            // Fetch the user profile data
            const fetchedProfileData = await Profile.fetch(userForSearch);
            // Display the fetched profile data
            Profile.show(fetchedProfileData);
            // Clear the input field
            searchUserInput.value = ``;
        }
    }
});
