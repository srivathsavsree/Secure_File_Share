# Deployment Instructions

## Step 1: Commit and push your changes to GitHub

```
git add .
git commit -m "Fix login redirect and API URL configuration"
git push
```

## Step 2: Update your application on Render

1. Go to your Render dashboard at https://dashboard.render.com/
2. Navigate to your frontend service (secure-file-share)
3. Click on "Manual Deploy" and select "Deploy latest commit"
4. Wait for the deployment to complete

## Step 3: Verify your environment variables

Make sure your environment variables are properly set in Render:

### Frontend
- `REACT_APP_API_URL`: Should be set to your backend API URL (e.g., https://secure-file-share-api.onrender.com/api)

### Backend
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key (at least 32 characters)
- `FRONTEND_URL`: Your frontend URL (e.g., https://secure-file-share-9kcs.onrender.com)

## Best Practices for JWT_SECRET and Environment Variables

1. **JWT_SECRET**: 
   - Generate a strong random string (at least 32 characters)
   - Never reuse it across different environments
   - Store it securely in your Render dashboard, not in your code

2. **MongoDB URI**:
   - Use environment-specific connection strings
   - Add network access restrictions in MongoDB Atlas
   - Use a separate database user with appropriate permissions

3. **Environment Variables Management**:
   - Use Render's environment variable management for production
   - Keep .env files out of version control
   - Use .env.example files to document required variables without actual values

## Troubleshooting

If you're still experiencing issues after deploying:

1. Check browser console for errors
2. Review Render logs for both frontend and backend services
3. Verify network requests in browser DevTools to ensure correct API URLs
4. Clear browser cache and local storage
