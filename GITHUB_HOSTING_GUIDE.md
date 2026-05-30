# Kisan Shuttering & Scaffolding
## Step-by-Step GitHub Pages Hosting & Deployment Guide

This guide describes how to export your premium multi-page Vite application from Google AI Studio and configure professional, automated hosting on **GitHub Pages** for **100% free with automated deployment (GitHub Actions)**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Export Your Code from Google AI Studio](#step-1-export-your-code-from-google-ai-studio)
3. [Step 2: Create a GitHub Repository](#step-2-create-a-github-repository)
4. [Step 3: Add Automated Deployment (GitHub Actions)](#step-3-add-automated-deployment-github-actions)
5. [Step 4: Push the Code to GitHub](#step-4-push-the-code-to-github)
6. [Step 5: Enable GitHub Pages in Repository Settings](#step-5-enable-github-pages-in-repository-settings)
7. [💡 Bonus: Setting Up a Custom Domain](#-bonus-setting-up-a-custom-domain)

---

## 1. Prerequisites
- A free **GitHub Account**. (Sign up at [github.com](https://github.com/) if you don't have one).
- **Git** installed on your computer (Optional, only if using Command Line/Terminal). Let's cover both the visual drag-and-drop method and the developer CLI method.

---

## Step 1: Export Your Code from Google AI Studio
1. In the Google AI Studio project building environment, look at the top right toolbar.
2. Click the **Export** or **Settings** menu.
3. Select **"Download as ZIP"** to download the complete codebase to your computer.
4. Extract the `.zip` file into a dedicated folder on your computer (e.g., `kisan-shuttering-website/`).

---

## Step 2: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. In the top-right corner, click the **`+`** icon and select **New repository**.
3. Fill in the repository details:
   - **Repository name**: `kisan-shuttering` (or any custom name of your choice).
   - **Public/Private**: Keep it **Public** (required for free GitHub Pages hosting).
   - **Initialize this repository with**: Leave all boxes unchecked (Do NOT add README, .gitignore, or license, as these are already included in your exported folder).
4. Click the green **Create repository** button.

---

## Step 3: Add Automated Deployment (GitHub Actions)
Since your website utilizes **Vite & Tailwind CSS**, it is a modern, compiled web application. Standard drag-and-drop uploads do not run the necessary build step (`npm run build`). Instead, we will set up **GitHub Actions** to build your site automatically whenever you make changes!

In your extracted project directory, create a new file named `.github/workflows/deploy.yml`:

```yaml
# .github/workflows/deploy.yml
name: Deploy Kisan Shuttering Website to GitHub Pages

on:
  push:
    branches:
      - main # Or "master" depending on your default branch name

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: write
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queue.
concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Build Production Bundle
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Build Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Step 4: Push the Code to GitHub

Choose **one** of the two methods below to upload your code:

### Method A: Using Command Line (Recommended)
Open your terminal or command prompt inside your project folder and run the following command sequence:

```bash
# Initialize local git repository
git init

# Add all files to staging area
git add .

# Create the first commit
git commit -m "Initial commit of Kisan Shuttering web app"

# Rename local main branch to main
git branch -M main

# Link to your new GitHub repository (Replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/kisan-shuttering.git

# Force-push files to GitHub
git push -u origin main --force
```

*(Note: Replace `YOUR_USERNAME` with your actual GitHub username).*

---

### Method B: Directly on the GitHub Portal (No Installation Method)
If you prefer not to use the terminal:
1. On your new repository page on GitHub, click **"uploading an existing file"** in the introduction subsection.
2. Drag and drop all files and folders (including `src/`, `.github/`, `package.json`, etc.) from your extracted local folder into the browser drop-zone.
3. Once loaded, write a commit message (e.g., `Add website files`) and click **Commit changes**.

---

## Step 5: Enable GitHub Pages in Repository Settings
1. Go to your repository on GitHub.
2. Click the **Settings** tab (gear icon at the top of the repository page).
3. On the left side menu, click **Pages**.
4. Inside the **Build and deployment** section:
   - Under **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
5. That’s it! Your GitHub Actions workflow will instantly kick off.

### Monitoring Deployment:
- Click the **Actions** tab at the top of your repository page to see the deployment progress.
- Once the workflow completes (shows a green checkmark), click on it. You will find the live public URL of your website!
- The link format will be: `https://YOUR_USERNAME.github.io/kisan-shuttering/`

---

## 💡 Bonus: Setting Up a Custom Domain
If you purchased a custom domain name (e.g. `www.kisanshuttering.com`), you can link it easily for free:
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Scroll to the **Custom domain** section.
3. Enter your domain name (e.g., `kisanshuttering.com`) and click **Save**.
4. Configure your domain registrar's DNS settings (such as GoDaddy or Namecheap) to point to GitHub's server IPs:
   - Register four **A Records** pointing to:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Register a **CNAME Record** for `www` to point to `YOUR_USERNAME.github.io`.
5. Check **Enforce HTTPS** on the GitHub Settings page for secure connections.
