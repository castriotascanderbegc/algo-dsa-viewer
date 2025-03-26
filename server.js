const express = require('express');     // express is a web framework
const axios = require('axios');         // to fetch data fron Github API
const cors = require('cors');           // to allow frontend requests
const rateLimit = require('express-rate-limit'); // to limit the number of client requests
const NodeCache = require("node-cache"); // to cache the fetched files
require('dotenv').config();             // for storing API keys safely

const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache expires after 1 hour

const GITHUB_API = process.env.GITHUB_API; // Github API key
const GITHUB_USERNAME = process.env.GITHUB_USERNAME; // Github username
const GITHUB_REPO = process.env.GITHUB_REPO // Github repo
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Github token

// Print the environment variables
console.log("Github API: ", GITHUB_API);
console.log("Github Username: ", GITHUB_USERNAME);
console.log("Github Repo: ", GITHUB_REPO);

// Create an express app
const app = express();
// Define the port
const PORT = process.env.PORT || 8000;

app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// initialize axios instance with GitHub API
const axiosInstance = axios.create({
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
    },
});

// ------ RATE LIMITER SETUP -------
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,            // 1 minute window
    max: 30,                        // Limit each IP to 30 requests per minute per IP (~1800/hour per IP)
    standardHeaders: true,          // Return rate limit info in headers
    legacyHeaders: false,
    handler: function (req, res) {
        res.status(429).json({ 
            error: "Too many requests from this IP, please try again after a minute."
        });
    },
});

// Apply rate limiter to all requests
app.use('/search', apiLimiter);
app.use('/filter', apiLimiter);
app.use('/files', apiLimiter);
app.use('/file', apiLimiter);

// ------------------------------------


// Fetch and cache the complete list of files initially
const fetchAllFiles = async () => {
    const cacheKey = "allFiles";
  
    // Serve from cache if available
    if (cache.has(cacheKey)) {
      console.log("Serving complete file list from cache");
      return cache.get(cacheKey);
    }
  
    // Helper to recursively fetch all files from GitHub
    const fetchFilesRecursively = async (path = "") => {
      const response = await axiosInstance.get(
        `${GITHUB_API}/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`
      );
  
      let files = [];
  
      for (const item of response.data) {
        if (item.type === "file") {
          files.push({ name: item.name, path: item.path });
        } else if (item.type === "dir") {
          const nestedFiles = await fetchFilesRecursively(item.path);
          files = files.concat(nestedFiles);
        }
      }
  
      return files;
    };
  
    // Fetch the complete set once
    const allFiles = await fetchFilesRecursively();
  
    // Cache the complete set
    cache.set(cacheKey, allFiles);
    return allFiles;
  };

// GET /files - Fetch all files from GitHub Repository recursively
app.get("/files", async (req, res) => {
    try {
        const files = await fetchAllFiles();
        res.json(files);

    } catch (error) {
        console.log("Error fetching files: ", error.message);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

const path = require('path');

// Get /file/:path - Fetch specific file content
app.get("/file/*", async (req, res) => {
    try {

        const filePath = req.params[0];

        const cacheKey = `file-${filePath}`;

        // Check if file is already cached
        if (cache.has(cacheKey)) {
            console.log("Fetching file from cache");
            return res.json(cache.get(cacheKey));
        }


        // Fetch file content from GitHub
        const response = await axiosInstance.get(
            `${GITHUB_API}/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filePath}`
        );

        const fileContent = Buffer.from(response.data.content, "base64").toString("utf8");

        // Cache the fetched file
        cache.set(cacheKey, { name: response.data.name, content: fileContent });

        res.json({ name: response.data.name, content: fileContent });

    } catch (error) {
        console.log("Error fetching file: ", error.message);
        res.status(500).json({ error: "Failed to fetch file" });
    }
});

// GET / search?query= - Search for files in GitHub Repository by their name
app.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Query is required" });
        
        const allFiles = await fetchAllFiles();

        const matchedFiles = allFiles.filter((file) => 
            file.name.toLowerCase().includes(query.toLowerCase())
        );
        res.json(matchedFiles);   
    } catch (error) {
        console.log("Error searching files: ", error.message);
        res.status(500).json({ error: "Failed to search files" });
    }
});

// GET /filter?dataStructure= - Filter files by data structure
app.get("/filter", async (req, res) => {
    try {
        const { dataStructure } = req.query;

        console.log("Data Structure Filter: ", dataStructure);

        if (!dataStructure) {
            return res.status(400).json({ error: "Data structure is required" });
        }

        const allFiles = await fetchAllFiles();

        // Match based on folder names in the path
        const filteredFiles = allFiles.filter((file) => 
            file.path.toLowerCase().includes(dataStructure.toLowerCase())
        );
        res.json(filteredFiles);
    } catch (error) {
        console.log("Error filtering files: ", error.message);
        res.status(500).json({ error: "Failed to filter files" });
    }
});