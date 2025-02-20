# 📂 DSA Problem Viewer - Backend

This repository contains code for the **backend** service for the **Algorithms and Data Structure Problem Viewer** application, built with **Node.js** and **Express.js**.

It serves as a bridge between my personal **GitHub Repository** containing solutions to common **Data Structures and Algorithms (DSA)** problems and the **React** frontend, exposing REST APIs to fetch and serve the DSA problem files.

---

## 🚀 **Objective**

The **DSA Problem Viewer** aims to provide a clean and interactive interface to browse, search, and filter through my personal solutions to **common DSA problems** stored in **algorithms-and-data-structures** GitHub repository. This backend service:

- Connects to the **GitHub API** to fetch file metadata and contents.
- Exposes APIs for:
  - Listing all files.
  - Searching files by name.
  - Filtering files based on **Data Structures**.
  - Fetching specific file content.

---

## ⚙️ **Tech Stack**

- **Node.js** — JavaScript runtime.
- **Express.js** — Web framework for building APIs.
- **Axios** — HTTP client to interact with the GitHub API.
- **dotenv** — Manage environment variables securely.
- **CORS** — Enable cross-origin requests from frontend.

---

## 🗂️ **Project Structure**

```plaintext
algo-dsa-viewer/
├── node_modules/
├── .env                   # Environment variables (GitHub token, repo info)
├── .gitignore
├── package.json
├── package-lock.json
├── server.js              # Main Express server
└── README.md              # Project documentation
```

---

## 🔗 **API Endpoints**

### 📁 **1. Get All Files**
Fetches all files recursively from the GitHub repository.

- **URL:** `GET /files`  
- **Response:**
  ```json
  [
    { "name": "array_sum.py", "path": "python/Algorithms & Data Structures for Beginners/Arrays/array_sum.py" },
    { "name": "graph_dfs.py", "path": "python/Advanced Algorithms/Graphs/graph_dfs.py" }
  ]
  ```

---

### 🔍 **2. Search Files**
Searches files by problem name.

- **URL:** `GET /search?query=<search_term>`
- **Example:** `/search?query=tree`
- **Response:**
```json
[
  { "name": "binary_tree_traversal.py", "path": "python/Algorithms & Data Structures for Beginners/Trees/binary_tree_traversal.py" }
]
```
---

### 🏷️ **3. Filter Files by Data Structure**
Filters files based on data structures like Arrays, Graphs, etc.

- **URL:**  `GET /filter?dataStructure=<structure>`
- **Example:**  `/filter?dataStructure=Graphs`
- **Response:**
```json
[
  { "name": "graph_dfs.py", "path": "python/Advanced Algorithms/Graphs/graph_dfs.py" },
  { "name": "graph_bfs.py", "path": "python/Advanced Algorithms/Graphs/graph_bfs.py" }
]
```
---

### 📄 **4. Get File Content**
Fetches the content of a specific file.

- **URL:**  `GET /file/<path>`
- **Example:** `/file/python/Advanced Algorithms/Graphs/graph_dfs.py`
- **Response:**
```json
{
  "name": "graph_dfs.py",
  "content": "# Python code for graph DFS..."
}
```

---

## 🔄 **API Flow Between Frontend and Backend** 

1. Frontend sends API calls (search, filter, list, or fetch file) to the backend.
2. Backend uses Axios to interact with the GitHub API.
3. Backend processes and returns the data in a frontend-friendly format.

---

## 🧪 **Running the Backend Locally**

### 1️⃣ Clone the Repo:
```bash
git clone https://github.com/castriotascanderbegc/algo-dsa-viewer.git
cd algo-dsa-viewer
```
---

### 2️⃣ **Install Dependencies:**
```bash
npm install
```
---

### 3️⃣ **Configure Environment Variables:**

Create a `.env` file:
```env
GITHUB_USERNAME=castriotascanderbegc
GITHUB_REPO=algorithms-and-data-structures
GITHUB_TOKEN=your-personal-access-token
```

---

### 4️⃣ **Run the Server:**

```bash
node server.js
```
The backend will be running at:

```bash
http://localhost:8000
```

---

## 📂 **Related Repositories**
- 🔗 Frontend Repo: [DSA Frontend](https://github.com/castriotascanderbegc/algo-dsa-viewer-ui)

---

## 💡 **Future Improvements**
Add authentication.
Implement caching for GitHub API responses.
Enhance error handling and rate limit management.

---
