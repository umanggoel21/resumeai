# Deploying ResumeAI to Vercel

This guide explains how to deploy the ResumeAI project to Vercel so that everyone can use it.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com/signup).
2.  **Gemini API Key**: You will need your `GEMINI_API_KEY` ready.

## Option 1: Using Vercel CLI (Fastest)

This method allows you to deploy directly from your terminal.

1.  **Install Vercel CLI**:
    Open your terminal and run:
    ```bash
    npm install -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```
    Follow the instructions to log in via your browser.

3.  **Deploy**:
    Run the following command in the project root:
    ```bash
    vercel
    ```
    *   Set up and deploy? **Y**
    *   Which scope? (Select your account)
    *   Link to existing project? **N**
    *   Project name? (Press Enter for default)
    *   In which directory is your code located? (Press Enter for `./`)
    *   **IMPORTANT**: When asked about "Environment Variables", say **Y** (Yes).
        *   Key: `GEMINI_API_KEY`
        *   Value: (Paste your actual API key from `.env.local`)
    *   Want to modify these settings? **N** (Auto-detect is usually correct for Vite)

4.  **Production Deployment**:
    The previous command deploys a "Preview". To deploy to production (live URL):
    ```bash
    vercel --prod
    ```

## Option 2: Using GitHub & Vercel Dashboard (Best for Updates)

This method automatically redeploys whenever you push changes to GitHub.

1.  **Initialize Git** (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Push to GitHub**:
    *   Create a new repository on GitHub.
    *   Follow GitHub's instructions to push your code.

3.  **Import to Vercel**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your GitHub repository.

4.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Environment Variables**:
        *   Expand the "Environment Variables" section.
        *   Key: `GEMINI_API_KEY`
        *   Value: (Your API Key)
        *   Click **Add**.

5.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to finish. You will get a live URL (e.g., `resumeai.vercel.app`).
