# Secure File Share

A modern, secure file sharing platform built with Node.js, Express, MongoDB, and React. Features end-to-end encryption, user authentication, file sharing with QR codes, and self-destructing files.

## Features

- **End-to-end encryption** using AES-256
- **User authentication** with JWT tokens
- **Secure file sharing** between users
- **QR code generation** for quick file access
- **Self-destructing files** (24-hour auto-expiration)
- **Responsive UI** for all devices
- **Rate limiting** to prevent abuse
- **Manual and auto-refresh** for file lists
- **Delete option** for shared files
- **Secure decryption key** entry via modal

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Crypto-JS** for file encryption
- **QRCode** for generating QR codes
- **Express-Rate-Limit** for API rate limiting

### Frontend
- **React 18** with functional components and hooks
- **React Context API** for state management
- **React Router** for navigation
- **Axios** for API communication
- **React Dropzone** for file uploads
- **React-Toastify** for notifications
- **React-Icons** for UI icons
- **CSS3** with custom styling

## Architecture

### Security Features

1. **End-to-End Encryption**: Files are encrypted using AES-256 before being stored on the server
2. **Secure Key Management**: Encryption keys are never stored in plaintext
3. **JWT Authentication**: Secure token-based authentication for API access
4. **Rate Limiting**: Prevents brute force and DoS attacks
5. **Secure File Transmission**: Files are decrypted client-side, never transmitted in plaintext

### Data Flow

1. **Upload Process**:
   - File selected by user
   - Encrypted client-side before upload
   - Stored encrypted on server
   - Share link and decryption key generated

2. **Download Process**:
   - User receives link and decryption key
   - Encrypted file downloaded
   - File decrypted locally using the key

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your MongoDB connection string
   - Set JWT secret key
   - Configure other settings as needed

4. Start the server:
   ```
   npm start
   ```
   
   For development with nodemon:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file with:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```
   - Adjust the URL if your backend is hosted elsewhere

4. Start the development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## Deployment

### Backend Deployment

1. **Heroku**:
   - Create a Procfile with: `web: node server.js`
   - Set environment variables in Heroku dashboard
   - Connect to MongoDB Atlas or other cloud MongoDB provider

2. **AWS/DigitalOcean**:
   - Set up a Node.js environment
   - Use PM2 for process management: `pm2 start server.js`
   - Configure Nginx as reverse proxy
   - Set up SSL with Let's Encrypt

### Frontend Deployment

1. **Netlify/Vercel**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Configure environment variables

2. **Traditional Hosting**:
   - Run `npm run build`
   - Upload the build folder to your hosting provider
   - Configure redirects for SPA routing

## Deployment Recommendations

### Option 1: Render (Recommended for Full-Stack Apps)

Render is an excellent choice for deploying this full-stack application because:

1. **Unified Platform**: Deploy both backend and frontend on the same platform
2. **Free Tier**: Offers a generous free tier for static sites and web services
3. **Database Integration**: Easy MongoDB integration through environment variables
4. **Built-in SSL**: Free SSL certificates for all services
5. **Easy CI/CD**: Automatic deployments from GitHub
6. **Zero Downtime Deploys**: Ensures your application remains available during updates

#### Steps to Deploy on Render:

1. **Backend (Web Service)**:
   - Sign up at render.com
   - Select "New Web Service" and connect your GitHub repo
   - Select the backend directory as the root directory
   - Set build command: `npm install`
   - Set start command: `node server.js`
   - Add all environment variables from your .env file
   - Select appropriate instance type (Free tier is fine for testing)

2. **Frontend (Static Site)**:
   - Select "New Static Site" on Render dashboard
   - Connect your GitHub repo
   - Set the frontend directory as the root directory
   - Set build command: `npm install && npm run build`
   - Set publish directory: `build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-service.onrender.com/api`

## Render Deployment Guide

### Option 1: Deploy Using render.yaml (Recommended)

1. **Push Your Code to GitHub**:
   ```
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

### Option 2: Manual Deployment

If you prefer to deploy manually without using the render.yaml file:

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

### Troubleshooting Deployment

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

### Post-Deployment Tasks

1. **Test File Upload and Sharing**:
   - Register a test account and upload a test file
   - Share the file with another test account
   - Verify encryption/decryption works correctly
   - Test QR code functionality

2. **Set Up a Custom Domain (Optional)**:
   - In Render dashboard, go to your service
   - Click on "Settings" > "Custom Domain"
   - Follow the instructions to configure your domain

3. **Set Up Monitoring (Optional)**:
   - Consider adding services like Sentry or LogRocket for error tracking
   - Set up uptime monitoring through services like UptimeRobot

## Final Recommendation

For this specific application (Secure File Share), **Render** is likely the better choice because:

1. The app has both backend and frontend components that need to work together
2. File uploads and encryption require robust backend support
3. Having everything on one platform simplifies management
4. Render's free tier is sufficient for demonstration purposes
5. Scaling options are available when needed

If you decide to use Vercel for the frontend and a separate service for the backend, ensure you properly configure CORS in the backend and update the API URL in the frontend.

## Usage Guide

### User Registration and Login

1. Create an account with your email and a secure password
2. Log in to access the dashboard

### Sharing a File

1. Enter recipient's email address
2. Select or drag and drop the file to upload
3. Click "Upload & Share"
4. The recipient will receive access to the file
5. Share the decryption key with the recipient via a secure channel

### Accessing a Shared File

1. Navigate to the "Received Files" tab
2. Find the file shared with you
3. Use the decryption key provided by the sender
4. Download and decrypt the file

### Using QR Codes

1. Generate a QR code for any shared file
2. Recipients can scan the QR code to access the file
3. They'll need to enter the decryption key to download

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   S e c u r e _ F i l e _ S h a r e  
 