// Dynamically import the CSS file
import "./css/style.css";

// For highlighting the code with Highlight.JS library which is fetched from the specefic github repo
hljs.highlightAll();

// Variables for HTML elements
const wrapper = document.getElementById("wrapper");
const searchUserInput = document.getElementById("searchUserInput");
const profileFullView = document.getElementById("profileFullView");
const profileFullViewWrapper = document.getElementById(
    "profileFullViewWrapper"
);
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
const repoUserText = document.getElementById("repoUser");
const repoNameText = document.getElementById("repoName");
const repoDescription = document.getElementById("repoDescription");
const repoLanguagesDiv = document.getElementById("repoLanguagesDiv");
const branchNameText = document.getElementById("branchName");
const fileNameText = document.getElementById("fileName");
const branchListHeaderText = document.getElementById("branchListHeaderText");
const branchLists = document.getElementById("branchLists");
const repoFullView = document.getElementById("repoFullView");
const loaderDivForBranch = document.getElementById("loaderDivForBranch");
const branchListWrapper = document.getElementById("branchListWrapper");
const codeBranchBtn = document.getElementById("codeBranch");
const filesContainer = document.getElementById("filesContainer");
const loaderDivForFileExplorer = document.getElementById(
    "loaderDivForFileExplorer"
);
const fileExplorerWrapper = document.getElementById("fileExplorerWrapper");
const loaderDivForFileName = document.getElementById("loaderDivForFileName");
const loaderDivForCode = document.getElementById("loaderDivForCode");
const mainCodeText = document.getElementById("mainCode");

// API base URL
const API_URL = process.env.API_URL;

// Variable to store the current branch for the repository
let currentBranchForRepo;

// Flag to indicate if a new repository has been opened
let newRepoOpened = true;

// Variable to store the currently active file element
let activeFileDiv;

// Array to store the active folder elements
const activeFolderDiv = [];

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

    /**
     * Resets the repository view to its initial state.
     */
    static resetRepo() {
        repoUserText.innerText = ``;
        repoNameText.innerText = ``;
        repoDescription.innerText = ``;
        repoLanguagesDiv.innerHTML = ``;
        branchNameText.innerText = ``;
        fileNameText.innerText = ``;
        mainCodeText.innerText = ``;
    }

    /**
     * Checks that the file is media file or not.
     */
    static isMediaFile(filename) {
        // Get the file extension from the filename
        const ext = filename
            .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
            .toLowerCase();

        // List of common media file extensions
        const mediaExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "bmp",
            "webp",
            "mp4",
            "avi",
            "mkv",
            "mov",
            "wmv",
            "flv",
            "webm",
            "mp3",
            "wav",
            "ogg",
            "flac",
            "aac"
        ];

        // Check if the file extension is in the list of media file extensions
        return mediaExtensions.includes(ext);
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
        mainCodeText.innerText = "";
        fileNameText.innerText = "Select a File";
        branchListWrapper.classList.remove("active");
        fileExplorerWrapper.classList.remove("active");
        wrapper.classList.remove("disabled");
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
            const fetchedProfile = await fetchedProfileRaw.json();

            // Check if the API call was successful
            if (fetchedProfile.statusCode === 0) {
                // Display an error message if the API call failed
                Show.info(`err`, fetchedProfile.status);
            } else {
                // Return the user's profile data if the API call was successful
                return fetchedProfile.status;
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
    }
}

/**
 * Repo class for fetching and displaying repository information.
 */
class Repo {
    /**
     * Fetches the repository data from the server.
     * @param {Object} params - Parameters for fetching the repository.
     * @param {string} params.repoName - The name of the repository.
     * @param {string} params.username - The username of the repository owner.
     * @returns {Object} The repository data if the API call is successful.
     */
    static async fetch({ repoName, username }) {
        try {
            // Define the API endpoint for fetching the repository data
            const apiForFetchRepo = `${API_URL}/api/fetchRepo`;

            // Make a POST request to the API with the repository name and username
            const fetchedRepoRaw = await fetch(apiForFetchRepo, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ repoName, username }) // Convert the data to a JSON string
            });

            // Parse the raw response as JSON
            const fetchedRepo = await fetchedRepoRaw.json();

            // Check if the API call was successful (statusCode === 0 indicates failure)
            if (fetchedRepo.statusCode === 0) {
                // Display an error message if the API call failed
                Show.info("err", fetchedRepo.status);
            } else {
                // Return the repository data if the API call was successful
                return fetchedRepo.status;
            }
        } catch (error) {
            // Log any errors that occur during the API call to the console
            console.log(error);
            // Display a general error message if something went wrong
            Show.info("err", "Something Went Wrong!");
        }
    }

    /**
     * Displays the repository data on the web page.
     * @param {Object} params - Parameters for displaying the repository.
     * @param {string} params.username - The username of the repository owner.
     * @param {string} params.repoName - The name of the repository.
     * @param {string} [params.description] - The description of the repository.
     * @param {Array} params.repoLanguages - Array of languages used in the repository.
     * @param {string} params.defaultBranch - The default branch of the repository.
     */
    static show({
        username,
        repoName,
        description,
        repoLanguages,
        defaultBranch
    }) {
        // Reset the repository display to its initial state
        UtilityToolkit.resetRepo();

        // Set the repository owner's username
        repoUserText.innerText = username;

        // Set the repository name
        repoNameText.innerText = repoName;

        // Set the repository description if provided
        if (description) repoDescription.innerText = description;

        // Display each language used in the repository along with its percentage
        repoLanguages.forEach(language => {
            const { name, percentage } = language;

            // Create wrapper and content elements for each language
            const repoLangWrapper = document.createElement("div");
            const repoMainLang = document.createElement("div");
            const repoLangPercentage = document.createElement("div");

            // Add appropriate CSS classes to the elements
            repoLangWrapper.classList.add("repoLangWrapper");
            repoMainLang.classList.add("repoMainLang");
            repoLangPercentage.classList.add("repoLangPercentage");

            // Set the language name and its percentage
            repoMainLang.innerText = name;
            repoLangPercentage.innerText = `${percentage}%`;

            // Append the language elements to the wrapper
            repoLangWrapper.append(repoMainLang, repoLangPercentage);
            repoLanguagesDiv.append(repoLangWrapper);
        });

        // Truncate the default branch name if it exceeds 13 characters
        if (defaultBranch.length > 13) {
            defaultBranch = defaultBranch.substring(0, 13) + "...";
        }

        // Set the default branch name
        branchNameText.innerText = defaultBranch;

        // Set the placeholder text for file selection
        fileNameText.innerText = "Select a File";

        // Hide the general loader and display the repository content
        loaderDivForGeneral.style.display = "none";
        mainContent.className = "repoView";
        repoFullView.style.display = "block";
    }
}

/**
 * Branches class for fetching and displaying all the Branch information of the repository.
 */
class Branches {
    /**
     * Fetch branch data from the server.
     * @param {Object} params - Parameters for fetching branches.
     * @param {string} params.username - The repository owner's username.
     * @param {string} params.repoName - The repository name.
     * @returns {Object} The branch data if successful.
     */
    static async fetch({ username, repoName }) {
        try {
            // API endpoint for fetching branches
            const apiForFetchBranches = `${API_URL}/api/fetchBranches`;

            // Send a POST request to the API with the repository name and username
            const fetchedBranchesRaw = await fetch(apiForFetchBranches, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ repoName, username }) // Convert data to JSON string
            });

            // Parse the raw response as JSON
            const fetchedBranches = await fetchedBranchesRaw.json();

            // Check if the API call was successful
            if (fetchedBranches.statusCode === 0) {
                // Display an error message if the API call failed
                Show.info("err", fetchedBranches.status);
            } else {
                // Return the branch data if the API call was successful
                return fetchedBranches.status;
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.log(error);
            // Display a generic error message if something went wrong
            Show.info("err", "Something Went Wrong!");
        }
    }

    /**
     * Display branch data on the page.
     * @param {Array} branches - List of branch names.
     */
    static show(branches) {
        // Reset the branch display to its initial state
        branchListHeaderText.innerText = `Branches`;
        branchLists.innerHTML = ``;

        // Check if there are no branches
        if (branches.length === 0) {
            // Display 'No Branches' if the branch list is empty
            branchListHeaderText.innerText = "No Branches";
        } else {
            // Loop through each branch name and create a display element for it
            branches.forEach(branchName => {
                const branch = document.createElement("div");

                // Highlight the current branch
                if (branchName === currentBranchForRepo) {
                    branch.classList.add("active");
                }
                branch.classList.add("branchName");
                branch.innerText = branchName;

                // Append the branch element to the branch list
                branchLists.append(branch);
            });

            // Hide the loading indicator and display the branch list
            loaderDivForBranch.style.display = "none";
            branchLists.style.display = "block";
        }
    }
}

/**
 * Files class for fetching and displaying all the files & folders of the repository.
 */
class Files {
    // Method to fetch files from the repository
    static async fetch({ username, repoName, path, currentBranchForRepo }) {
        try {
            // API endpoint for fetching files
            const apiForFetchFiles = `${API_URL}/api/fetchFiles`;

            // Send a POST request to the API with the repository name, username, path, and current branch
            const fetchedFilesRaw = await fetch(apiForFetchFiles, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    repoName,
                    username,
                    path,
                    currentBranchForRepo
                }) // Convert data to JSON string
            });

            // Parse the raw response as JSON
            const fetchedFiles = await fetchedFilesRaw.json();

            // Check if the API call was successful
            if (fetchedFiles.statusCode === 0) {
                // Display an error message if the API call failed
                Show.info("err", fetchedFiles.status);
            } else {
                // Return the files data if the API call was successful
                return fetchedFiles.status;
            }
        } catch (error) {
            // Log any errors that occur during the API call
            console.log(error);
            // Display a generic error message if something went wrong
            Show.info("err", "Something Went Wrong!");
        }
    }

    // Method to display files and directories
    static show(files, subFilesDir) {
        // Clear the files container or sub-files container if it exists
        if (!subFilesDir) {
            filesContainer.innerHTML = ``;
        } else {
            subFilesDir.innerHTML = ``;
        }

        // Loop through each file and directory and create elements to display them
        files.forEach(file => {
            if (file.type === `dir`) {
                // Create a div element for the directory
                const contentTypeDirDiv = document.createElement(`div`);
                contentTypeDirDiv.classList.add(`contentTypeDir`);

                // Create a div element for the directory name and icons
                const nameIconDivDirDiv = document.createElement(`div`);
                nameIconDivDirDiv.classList.add(`nameIconDivDir`);
                nameIconDivDirDiv.setAttribute(`data-name`, file.name);
                nameIconDivDirDiv.setAttribute(`data-path`, file.path);
                nameIconDivDirDiv.setAttribute(`data-type`, file.type);
                nameIconDivDirDiv.setAttribute(
                    `data-downloadUrl`,
                    file.downloadUrl
                );

                // Create span elements for the arrows and folder icons
                const arrowClosedSpan = document.createElement(`span`);
                arrowClosedSpan.classList.add(
                    `material-symbols-rounded`,
                    `arrowClosed`
                );
                arrowClosedSpan.textContent = `chevron_right`;

                const arrowExpandedSpan = document.createElement(`span`);
                arrowExpandedSpan.classList.add(
                    `material-symbols-rounded`,
                    `arrowExpanded`
                );
                arrowExpandedSpan.style.display = `none`;
                arrowExpandedSpan.textContent = `expand_more`;

                const folderClosedSpan = document.createElement(`span`);
                folderClosedSpan.classList.add(
                    `material-symbols-rounded`,
                    `folderClosed`
                );
                folderClosedSpan.textContent = `folder`;

                const folderExpandedSpan = document.createElement(`span`);
                folderExpandedSpan.classList.add(
                    `material-symbols-rounded`,
                    `folderExpanded`
                );
                folderExpandedSpan.style.display = `none`;
                folderExpandedSpan.textContent = `folder_open`;

                // Create a div element for the directory name
                const dirNameDiv = document.createElement(`div`);
                dirNameDiv.classList.add(`dirName`);
                dirNameDiv.textContent = file.name;

                // Append the arrows, folder icons, and directory name to the directory div
                nameIconDivDirDiv.appendChild(arrowClosedSpan);
                nameIconDivDirDiv.appendChild(arrowExpandedSpan);
                nameIconDivDirDiv.appendChild(folderClosedSpan);
                nameIconDivDirDiv.appendChild(folderExpandedSpan);
                nameIconDivDirDiv.appendChild(dirNameDiv);

                // Append the directory name and icons div to the directory container div
                contentTypeDirDiv.appendChild(nameIconDivDirDiv);

                // Create a div element for sub-files within the directory
                const subFilesDiv = document.createElement(`div`);
                subFilesDiv.classList.add(`subFilesDiv`);

                // Create a loader div for loading sub-files
                const loaderDivForSubFilesDiv = document.createElement(`div`);
                loaderDivForSubFilesDiv.classList.add(`loaderDivForSubFiles`);

                const customLoaderDiv = document.createElement(`div`);
                customLoaderDiv.classList.add(`custom-loader`);

                loaderDivForSubFilesDiv.appendChild(customLoaderDiv);

                subFilesDiv.appendChild(loaderDivForSubFilesDiv);

                contentTypeDirDiv.appendChild(subFilesDiv);

                // Append the directory container to the main files container or sub-files container
                if (!subFilesDir) {
                    filesContainer.appendChild(contentTypeDirDiv);
                } else {
                    subFilesDir.appendChild(contentTypeDirDiv);
                }
            }
        });

        // Loop through each file and create elements to display them
        files.forEach(file => {
            if (file.type === `file`) {
                // Create a div element for the file
                const contentTypeFileDiv = document.createElement(`div`);
                contentTypeFileDiv.classList.add(`contentTypeFile`);

                // Create a div element for the file name and icon
                const nameIconDivFileDiv = document.createElement(`div`);
                nameIconDivFileDiv.classList.add(`nameIconDivFile`);
                nameIconDivFileDiv.setAttribute(`data-name`, file.name);
                nameIconDivFileDiv.setAttribute(`data-path`, file.path);
                nameIconDivFileDiv.setAttribute(`data-type`, file.type);
                nameIconDivFileDiv.setAttribute(
                    `data-downloadurl`,
                    file.downloadUrl
                );

                // Create a span element for the file icon
                const fileIconSpan = document.createElement(`span`);
                fileIconSpan.classList.add(
                    `material-symbols-rounded`,
                    `fileIcon`
                );
                fileIconSpan.textContent = `description`;

                // Create a div element for the file name
                const fileNameDiv = document.createElement(`div`);
                fileNameDiv.classList.add(`fileName`);
                fileNameDiv.setAttribute(`data-type`, file.type);
                fileNameDiv.setAttribute(`data-downloadurl`, file.downloadUrl);
                fileNameDiv.textContent = file.name;

                // Append the file icon and file name to the file div
                nameIconDivFileDiv.appendChild(fileIconSpan);
                nameIconDivFileDiv.appendChild(fileNameDiv);

                // Append the file div to the main files container or sub-files container
                contentTypeFileDiv.appendChild(nameIconDivFileDiv);

                if (!subFilesDir) {
                    filesContainer.appendChild(contentTypeFileDiv);
                } else {
                    subFilesDir.appendChild(contentTypeFileDiv);
                }
            }
        });

        // Hide the loader and display the files container or sub-files container
        if (!subFilesDir) {
            loaderDivForFileExplorer.style.display = `none`;
            filesContainer.style.display = `block`;
            fileExplorerWrapper.classList.add(`active`);
            newRepoOpened = false;
        } else {
            subFilesDir.children[0].style.display = `block`;
        }
    }
}

class Codes {
    // Method to fetch code from the given download URL
    static async fetch(downloadURL) {
        try {
            // Fetch the code from the provided URL
            const fetchedCode = await (await fetch(downloadURL)).text();
            return fetchedCode;
        } catch (error) {
            // Log any errors that occur during the fetch operation
            console.log(error);
            // Display a generic error message if something went wrong
            Show.info("err", "Something Went Wrong!");
        }
    }

    // Method to display the fetched code
    static show({ fileName, fetchedCode, nameIconDivFile }) {
        // Hide the info div and loader
        infoDiv.style.display = "none";
        loaderDivForFileName.style.display = "none";

        // Display the file name
        fileNameText.innerText = fileName;
        loaderDivForCode.style.display = "none";

        // Highlight the code if it's not a markdown file, otherwise display as plain text
        if (!fileName.endsWith(".md")) {
            mainCode.innerHTML = hljs.highlightAuto(fetchedCode).value;
        } else {
            mainCode.innerText = fetchedCode;
        }

        // If the file is in the main files container
        if (
            nameIconDivFile.parentElement.parentElement.id === "filesContainer"
        ) {
            // Remove the 'active' class from all active folders
            activeFolderDiv.forEach(activeFolder => {
                activeFolder.classList.remove("active");
            });
            activeFolderDiv.length = 0;

            // Remove the 'active' class from the previously active file
            if (activeFileDiv) {
                activeFileDiv.classList.remove("active");
            }

            // Add the 'active' class to the current file
            nameIconDivFile.classList.add("active");
            activeFileDiv = nameIconDivFile;
        } else {
            // If the file is in a sub-files container
            const subFilesDiv = nameIconDivFile.parentElement.parentElement;

            // Remove the 'active' class from the previously active file
            if (activeFileDiv) {
                activeFileDiv.classList.remove("active");
            }

            // Add the 'active' class to the current file
            nameIconDivFile.classList.add("active");
            activeFileDiv = nameIconDivFile;

            // Remove the 'active' class from all active folders
            if (activeFolderDiv.length !== 0) {
                activeFolderDiv.forEach(activeFolder => {
                    activeFolder.classList.remove("active");
                });
                activeFolderDiv.length = 0;
            }

            // Function to add the 'active' class to all parent folders of the current file
            function activeAllParentFolder(subFilesDiv) {
                subFilesDiv.previousElementSibling.classList.add("active");
                activeFolderDiv.push(subFilesDiv.previousElementSibling);

                // Recursively add 'active' class to parent folders if they exist
                if (
                    subFilesDiv.parentElement.parentElement.classList.contains(
                        "subFilesDiv"
                    )
                ) {
                    activeAllParentFolder(
                        subFilesDiv.parentElement.parentElement
                    );
                }
            }
            activeAllParentFolder(subFilesDiv);
        }
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

// Event listener for clicking on repository names
reposContainer.addEventListener("click", async e => {
    if (e.target.className === "repoName") {
        const username = usernameText.innerText.substring(1); // Get the username
        const repoName = e.target.innerText; // Get the repository name

        // Hide profile view and show loader
        profileFullViewWrapper.style.display = "none";
        loaderDivForGeneral.style.display = "block";

        // Fetch repository details
        const { description, repoLanguages, defaultBranch } = await Repo.fetch({
            username,
            repoName
        });

        // Set the current branch and show repository details
        currentBranchForRepo = defaultBranch;
        newRepoOpened = true;
        Repo.show({
            username,
            repoName,
            description,
            repoLanguages,
            defaultBranch
        });
    }
});

// Event listener for clicking on the repository username
repoUserText.addEventListener("click", () => {
    repoFullView.style.display = "none"; // Hide repository view
    mainContent.className = "profileView"; // Show profile view
    infoDiv.style.display = "none";
    profileFullView.style.display = "block";
    profileFullViewWrapper.style.display = "block";
});

// Event listener for clicking the code branch button
codeBranchBtn.addEventListener("click", async () => {
    const username = repoUserText.innerText; // Get the username
    const repoName = repoNameText.innerText; // Get the repository name

    // Show loader and disable wrapper
    loaderDivForBranch.style.display = "flex";
    wrapper.classList.add("disabled");
    branchLists.style.display = "none";
    branchListWrapper.classList.add("active");

    // Fetch and display branches
    const branches = await Branches.fetch({ username, repoName });
    Branches.show(branches);
});

// Event listener for clicking on branch names
branchListWrapper.addEventListener("click", e => {
    if (e.target.classList.contains("branchName")) {
        let newBranch = e.target.innerText; // Get the new branch name

        // Set the current branch and update UI
        currentBranchForRepo = newBranch;
        if (newBranch.length > 13) {
            newBranch = newBranch.substring(0, 13) + "...";
        }
        branchNameText.innerText = newBranch;
        fileNameText.innerText = "Select a file";

        // Hide branch list and enable wrapper
        infoDiv.style.display = "none";
        branchListWrapper.classList.remove("active");
        mainCodeText.innerText = ``;
        wrapper.classList.remove("disabled");
        newRepoOpened = true;
    }
});

// Event listener for the files icon click event
filesIcon.addEventListener("click", async () => {
    // Check if a new repository has been opened
    if (newRepoOpened) {
        const username = repoUserText.innerText;
        const repoName = repoNameText.innerText;

        // Disable the wrapper and hide the files container while loading
        wrapper.classList.add("disabled");
        filesContainer.style.display = "none";
        loaderDivForFileExplorer.style.display = "flex";
        fileExplorerWrapper.classList.add("active");

        // Fetch files from the repository
        const fetchedFiles = await Files.fetch({
            username,
            repoName,
            currentBranchForRepo
        });

        // Display fetched files
        Files.show(fetchedFiles);
    } else {
        // If no new repository, show the files container and enable the wrapper
        if (activeFolderDiv.length !== 0) {
            activeFolderDiv.forEach(activeFolder => {
                if (activeFolder.children[1].style.display === "none") {
                    // Toggle folder display to expanded state
                    activeFolder.children[0].style.display = "none";
                    activeFolder.children[1].style.display = "";
                    activeFolder.children[2].style.display = "none";
                    activeFolder.children[3].style.display = "";
                    activeFolder.nextElementSibling.style.display = "block";
                }
            });
        }
        wrapper.classList.add("disabled");
        filesContainer.style.display = "block";
        fileExplorerWrapper.classList.add("active");
    }
});

// Event listener for click events on the files container to expand folders
filesContainer.addEventListener("click", async e => {
    // Check if the click is on a closed arrow or folder icon
    if (
        e.target.classList.contains("arrowClosed") ||
        e.target.classList.contains("folderClosed")
    ) {
        const subFilesDir = e.target.parentElement.nextElementSibling;
        const nameIconDivDir = subFilesDir.previousElementSibling;
        const arrowClosed = nameIconDivDir.children[0];
        const arrowExpanded = nameIconDivDir.children[1];
        const folderClosed = nameIconDivDir.children[2];
        const folderExpanded = nameIconDivDir.children[3];

        // Toggle the display of arrows and folders to expanded state
        arrowClosed.style.display = "none";
        folderClosed.style.display = "none";
        arrowExpanded.style.display = "";
        folderExpanded.style.display = "";

        // Ensure all active folders are displayed correctly
        if (activeFolderDiv.length !== 0) {
            activeFolderDiv.forEach(activeFolder => {
                if (activeFolder.children[1].style.display === "none") {
                    // Toggle folder display to expanded state
                    activeFolder.children[0].style.display = "none";
                    activeFolder.children[1].style.display = "";
                    activeFolder.children[2].style.display = "none";
                    activeFolder.children[3].style.display = "";
                    activeFolder.nextElementSibling.style.display = "block";
                }
            });
        }
        subFilesDir.style.display = "block";

        // Fetch and display sub-files if not already loaded
        if (
            !subFilesDir.parentElement.children[0].classList.contains("active")
        ) {
            subFilesDir.children[0].style.display = "block";
            const { path } = Object.assign({}, e.target.parentElement.dataset);
            const username = repoUserText.innerText;
            const repoName = repoNameText.innerText;

            const fetchedFiles = await Files.fetch({
                username,
                repoName,
                path,
                currentBranchForRepo
            });

            // Display fetched sub-files
            Files.show(fetchedFiles, subFilesDir);
        }
    }
});

// Event listener for click events on the files container to collapse folders
filesContainer.addEventListener("click", async e => {
    // Check if the click is on an expanded arrow or folder icon
    if (
        e.target.classList.contains("arrowExpanded") ||
        e.target.classList.contains("folderExpanded")
    ) {
        const subFilesDir = e.target.parentElement.nextElementSibling;
        const nameIconDivDir = subFilesDir.previousElementSibling;
        const arrowClosed = nameIconDivDir.children[0];
        const arrowExpanded = nameIconDivDir.children[1];
        const folderClosed = nameIconDivDir.children[2];
        const folderExpanded = nameIconDivDir.children[3];

        // Toggle the display of arrows and folders to collapsed state
        arrowClosed.style.display = "";
        folderClosed.style.display = "";
        arrowExpanded.style.display = "none";
        folderExpanded.style.display = "none";
        subFilesDir.style.display = "none";
    }
});

// Event listener for click events on file icons or file names
filesContainer.addEventListener("click", async e => {
    // Check if the click is on a file icon or file name
    if (
        e.target.classList.contains("fileIcon") ||
        e.target.classList.contains("fileName")
    ) {
        const nameIconDivFile = e.target.parentElement;
        const fileName = nameIconDivFile.dataset.name;
        const downloadURL = nameIconDivFile.dataset.downloadurl;

        // Check if the file is a media file
        if (UtilityToolkit.isMediaFile(fileName)) {
            window.open(downloadURL, "_blank");
        } else {
            // Reset and display loaders for file name and code
            infoDiv.style.display = "none";
            mainCodeText.innerText = "";
            fileNameText.innerText = "";
            loaderDivForFileName.style.display = "flex";
            loaderDivForCode.style.display = "flex";
            wrapper.classList.remove("disabled");
            fileExplorerWrapper.classList.remove("active");

            // Fetch the file code
            const fetchedCode = await Codes.fetch(downloadURL);

            // Display the fetched code
            Codes.show({ fileName, fetchedCode, nameIconDivFile });
        }
    }
});

// Event listener for closing the branch list
closeBtnBranch.addEventListener("click", () => {
    branchListWrapper.classList.remove("active"); // Hide branch list
    wrapper.classList.remove("disabled"); // Enable wrapper
});

// Event listener for closing the file explorer
closeBtnFiles.addEventListener("click", () => {
    fileExplorerWrapper.classList.remove("active"); // Hide file explorer
    wrapper.classList.remove("disabled"); // Enable wrapper
});
