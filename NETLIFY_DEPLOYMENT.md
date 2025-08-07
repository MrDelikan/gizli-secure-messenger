# 🚀 Deploy Gizli to Netlify (FREE)

## Step 1: Prepare Your Code
Your code is already ready! Just need to:

1. Create a GitHub repository (if you don't have one)
2. Push your code to GitHub

## Step 2: Deploy to Netlify

### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag your `gizli-deploy.zip` file to Netlify
4. Done! You get a URL like `amazing-app-123.netlify.app`

### Option B: Connect GitHub (Automatic updates)
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

## Step 3: Add Your Custom Domain (gizli.se)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter: `gizli.se`
4. Netlify will show you DNS records to add

## Step 4: Update DNS at Loopia

In your Loopia control panel, add these DNS records:
```
Type: A
Name: @ (or blank)
Value: 75.2.60.5

Type: CNAME  
Name: www
Value: amazing-app-123.netlify.app
```

## Step 5: Enable HTTPS
Netlify automatically provides free SSL certificates!

## Total Cost: FREE! 🎉

Your app will be live at:
- https://gizli.se
- https://www.gizli.se

## Benefits:
✅ FREE hosting
✅ Automatic HTTPS/SSL
✅ Global CDN (fast worldwide)
✅ Automatic deployments
✅ Custom domain support
✅ Built for React/Vite apps
