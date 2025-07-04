# 🔐 Secure File Share

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-16.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Render](https://img.shields.io/badge/Render-Deploy-violet.svg)](https://render.com)

</div>

<p align="center">
A modern, secure file sharing platform with end-to-end encryption, user authentication, QR code sharing, and self-destructing files.
</p>

## ✨ Features

<div align="center">
<table>
  <tr>
    <td align="center"><b>🔒</b></td>
    <td><b>End-to-end encryption</b> using AES-256</td>
    <td align="center"><b>🔑</b></td>
    <td><b>User authentication</b> with JWT tokens</td>
  </tr>
  <tr>
    <td align="center"><b>🔄</b></td>
    <td><b>Secure file sharing</b> between users</td>
    <td align="center"><b>📱</b></td>
    <td><b>QR code generation</b> for quick file access</td>
  </tr>
  <tr>
    <td align="center"><b>⏱️</b></td>
    <td><b>Self-destructing files</b> (24-hour auto-expiration)</td>
    <td align="center"><b>📱</b></td>
    <td><b>Responsive UI</b> for all devices</td>
  </tr>
  <tr>
    <td align="center"><b>🛡️</b></td>
    <td><b>Rate limiting</b> to prevent abuse</td>
    <td align="center"><b>🔄</b></td>
    <td><b>Manual and auto-refresh</b> for file lists</td>
  </tr>
  <tr>
    <td align="center"><b>🗑️</b></td>
    <td><b>Delete option</b> for shared files</td>
    <td align="center"><b>🔐</b></td>
    <td><b>Secure decryption key</b> entry via modal</td>
  </tr>
</table>
</div>

## 🛠️ Tech Stack

<div align="center">
<table>
  <tr>
    <th>Backend</th>
    <th>Frontend</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>Node.js with Express.js</li>
        <li>MongoDB with Mongoose ODM</li>
        <li>JWT for authentication</li>
        <li>Bcrypt for password hashing</li>
        <li>Multer for file uploads</li>
        <li>Crypto-JS for file encryption</li>
        <li>QRCode for generating QR codes</li>
        <li>Express-Rate-Limit for API rate limiting</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>React 18 with functional components and hooks</li>
        <li>React Context API for state management</li>
        <li>React Router for navigation</li>
        <li>Axios for API communication</li>
        <li>React Dropzone for file uploads</li>
        <li>React-Toastify for notifications</li>
        <li>React-Icons for UI icons</li>
        <li>CSS3 with custom styling</li>
      </ul>
    </td>
  </tr>
</table>
</div>

## 🏗️ Architecture

### 🔒 Security Features

<table>
  <tr>
    <td><b>1. End-to-End Encryption</b></td>
    <td>Files are encrypted using AES-256 before being stored on the server</td>
  </tr>
  <tr>
    <td><b>2. Secure Key Management</b></td>
    <td>Encryption keys are never stored in plaintext</td>
  </tr>
  <tr>
    <td><b>3. JWT Authentication</b></td>
    <td>Secure token-based authentication for API access</td>
  </tr>
  <tr>
    <td><b>4. Rate Limiting</b></td>
    <td>Prevents brute force and DoS attacks</td>
  </tr>
  <tr>
    <td><b>5. Secure File Transmission</b></td>
    <td>Files are decrypted client-side, never transmitted in plaintext</td>
  </tr>
</table>

### 🔄 Data Flow

#### 📤 Upload Process:
1. File selected by user
2. Encrypted client-side before upload
3. Stored encrypted on server
4. Share link and decryption key generated

#### 📥 Download Process:
1. User receives link and decryption key
2. Encrypted file downloaded
3. File decrypted locally using the key

## 🚀 Setup and Installation

### 📋 Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### ⚙️ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your MongoDB connection string
   - Set JWT secret key
   - Configure other settings as needed

4. Start the server:
   ```bash
   npm start
   ```
   
   For development with nodemon:
   ```bash
   npm run dev
   ```

### 🖥️ Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file with:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```
   - Adjust the URL if your backend is hosted elsewhere

4. Start the development server:
   ```bash
   npm start
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🌐 Deployment

<div align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/render/render-original.svg" height="80" />
</div>

### 🌟 Render Deployment Guide (Recommended)

#### Option 1: Deploy Using render.yaml (Recommended)

1. **Push Your Code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Connect to Render**:
   - Create an account at [render.com](https://render.com)
   - Go to the Dashboard and click "New" > "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to create both services (API and Frontend)

3. **Set Environment Variables**:
   - Once the services are created, go to each service
   - For the backend service (`secure-file-share-api`), add these environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing

4. **Verify Deployment**:
   - After deployment completes, visit your frontend URL (e.g., `https://secure-file-share.onrender.com`)
   - Test the application to ensure everything works properly

<details>
<summary><b>📋 Manual Deployment Option (Click to expand)</b></summary>

#### Backend Deployment

1. **Create a Web Service**:
   - Go to the Render dashboard and click "New" > "Web Service"
   - Connect your GitHub repository
   - Choose the directory: `backend`
   - Set runtime to Node
   - Set build command: `npm install`
   - Set start command: `node server.js`

2. **Environment Variables**:
   Add the following environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=24h
   FILE_UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=50000000
   ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,txt,zip,rar,xlsx,pptx
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

#### Frontend Deployment

1. **Create a Static Site**:
   - Go to the Render dashboard and click "New" > "Static Site"
   - Connect your GitHub repository
   - Choose the directory: `frontend`
   - Set build command: `npm install && npm run build`
   - Set publish directory: `build`

2. **Environment Variables**:
   Add the following environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Add a Redirect Rule**:
   - In the "Redirects/Rewrites" tab, add a rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: "Rewrite"
</details>

### 🔍 Troubleshooting Deployment

<details>
<summary><b>Common Issues and Solutions (Click to expand)</b></summary>

1. **CORS Issues**:
   - Double-check that the `FRONTEND_URL` in backend env variables exactly matches your frontend URL
   - Ensure the backend correctly configures CORS (this is already set up in server.js)

2. **MongoDB Connection**:
   - Make sure your MongoDB Atlas (or other provider) is configured to accept connections from any IP
   - Check that your connection string is correct and includes the database name

3. **Render Logs**:
   - If you encounter issues, check the Render logs for both services
   - The logs often provide specific error messages to help debug problems

4. **Build Failures**:
   - If build fails, make sure all dependencies are properly listed in package.json
   - Check that there are no environment-specific code that might fail in production
</details>

### ✅ Post-Deployment Checklist

<details>
<summary><b>Click to expand</b></summary>

- [ ] Verify all environment variables are correctly set
- [ ] Test user registration and login
- [ ] Test file upload functionality
- [ ] Test file sharing with QR codes
- [ ] Test file download with decryption
- [ ] Check mobile responsiveness
- [ ] Monitor application logs for any errors
</details>

## 📖 Usage Guide

<div align="center">
<table>
  <tr>
    <th width="33%"><img src="https://img.icons8.com/color/96/000000/add-user-male--v1.png" width="50"/><br/>User Registration</th>
    <th width="33%"><img src="https://img.icons8.com/color/96/000000/upload-to-cloud--v1.png" width="50"/><br/>Sharing Files</th>
    <th width="33%"><img src="https://img.icons8.com/color/96/000000/download-from-cloud--v1.png" width="50"/><br/>Accessing Files</th>
  </tr>
  <tr>
    <td>
      <ol>
        <li>Create an account with email and password</li>
        <li>Log in to access the dashboard</li>
      </ol>
    </td>
    <td>
      <ol>
        <li>Enter recipient's email address</li>
        <li>Select or drag and drop the file</li>
        <li>Click "Upload & Share"</li>
        <li>Share the decryption key securely</li>
      </ol>
    </td>
    <td>
      <ol>
        <li>Go to "Received Files" tab</li>
        <li>Find the shared file</li>
        <li>Enter the decryption key</li>
        <li>Download and access the file</li>
      </ol>
    </td>
  </tr>
</table>
</div>

### 📱 Using QR Codes

1. Generate a QR code for any shared file
2. Recipients can scan the QR code to access the file
3. They'll need to enter the decryption key to download

## 📸 Screenshots

<div align="center">
<table>
  <tr>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=Login+Screen" alt="Login Screen" width="100%"/></td>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=Dashboard" alt="Dashboard" width="100%"/></td>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=File+Sharing" alt="File Sharing" width="100%"/></td>
  </tr>
  <tr>
    <td><p align="center"><b>Login Screen</b></p></td>
    <td><p align="center"><b>Dashboard</b></p></td>
    <td><p align="center"><b>File Sharing</b></p></td>
  </tr>
  <tr>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=QR+Code+Modal" alt="QR Code Modal" width="100%"/></td>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=File+Download" alt="File Download" width="100%"/></td>
    <td width="33%"><img src="https://via.placeholder.com/400x225.png?text=Mobile+View" alt="Mobile View" width="100%"/></td>
  </tr>
  <tr>
    <td><p align="center"><b>QR Code Modal</b></p></td>
    <td><p align="center"><b>File Download</b></p></td>
    <td><p align="center"><b>Mobile View</b></p></td>
  </tr>
</table>
</div>

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

<p align="center">
<a href="https://github.com/srivathsavsree/Secure_File_Share">
<img src="https://img.shields.io/badge/GitHub-View%20Repository-blue?style=for-the-badge&logo=github" alt="GitHub Repository">
</a>
</p>

<p align="center">
<b>Made with ❤️ by srivathsavsree</b>
</p>
#   S e c u r e _ F i l e _ S h a r e 
 
 