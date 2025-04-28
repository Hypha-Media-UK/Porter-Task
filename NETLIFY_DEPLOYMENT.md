# Deploying Porter Task App to Netlify

This document outlines the step-by-step process to deploy the Porter Task application to Netlify.

## Prerequisites

- A Netlify account (free tier is sufficient)
- Git installed on your local machine
- Node.js and npm installed

## Step 1: Prepare the Project

The project has already been prepared for Netlify deployment with the following elements:

- A `netlify.toml` configuration file
- Serverless functions in the `netlify/functions` directory
- Updated API utilities to work with Netlify functions

## Step 2: Create a Git Repository

1. Initialize a Git repository (if you haven't already):

```bash
git init
git add .
git commit -m "Initial commit - Ready for Netlify deployment"
```

2. Create a repository on GitHub/GitLab/Bitbucket
3. Push your local repository to the remote:

```bash
git remote add origin <your-repository-url>
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the Porter Task repository
6. Configure the build settings:
   - Build command: `vite build`
   - Publish directory: `dist`
7. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Login to Netlify:

```bash
netlify login
```

3. Initialize your site:

```bash
netlify init
```

4. Follow the prompts to connect to your Git repository
5. Deploy your site:

```bash
netlify deploy --prod
```

## Step 4: Configure Environment Variables (If Needed)

If your application requires environment variables:

1. Go to your site settings in Netlify
2. Navigate to "Build & deploy" > "Environment"
3. Add the necessary environment variables

## Step 5: Test Your Deployed Application

1. Visit your Netlify URL (e.g., `https://your-site-name.netlify.app`)
2. Test all functionality to ensure everything works as expected:
   - Creating and managing shifts
   - Adding and removing porters
   - Creating and completing tasks
   - Settings management

## Troubleshooting

### Function Invocation Issues

If you encounter issues with Netlify Functions:

1. Check the Function logs in the Netlify dashboard
2. Ensure your API paths match the expected format (`/.netlify/functions/function-name`)

### Build Failures

If the build fails:

1. Check the build logs in the Netlify dashboard
2. Ensure all dependencies are properly installed
3. Verify that the build command is correct

### Routing Issues

If you encounter routing issues:

1. Ensure the `netlify.toml` file includes the proper redirect rules
2. Check that your Vue Router is properly configured for history mode

## Continuous Deployment

Once set up, Netlify will automatically deploy your site when you push changes to your repository.
