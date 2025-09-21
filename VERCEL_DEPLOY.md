# Vercel Deployment Guide

This project is configured for deployment on Vercel. Follow these steps to deploy your LLM Avatar Chat application.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/llm-avatar-chat)

## Manual Deployment Steps

### 1. Prerequisites
- GitHub/GitLab repository with your code
- Vercel account ([sign up here](https://vercel.com))

### 2. Environment Variables
Set these environment variables in your Vercel project settings:

```bash
SARVAM_API_HOST=your_sarvam_api_host_here
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and log in
2. Click "New Project"
3. Import your repository
4. Vercel will auto-detect the Vite framework
5. Add environment variables in project settings
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add SARVAM_API_HOST
```

### 4. Configuration Files

The project includes these Vercel-specific files:

- **`vercel.json`** - Vercel configuration with build settings and API routes
- **`api/proxy.js`** - Serverless function to handle API proxying
- **`.vercelignore`** - Files to exclude from deployment
- **`vite.config.ts`** - Updated with production optimizations

### 5. Post-Deployment

After deployment:

1. **Test the avatar** - Verify 3D model loads correctly
2. **Test TTS functionality** - Ensure Sarvam AI integration works
3. **Check API endpoints** - Verify `/api/proxy` endpoint functions
4. **Mobile responsiveness** - Test on different devices

### 6. Troubleshooting

#### Common Issues:

**Build Fails:**
```bash
# Check build locally
npm run build
npm run preview
```

**API Not Working:**
- Verify `SARVAM_API_HOST` environment variable is set
- Check Vercel function logs in dashboard

**3D Models Not Loading:**
- Ensure `public/models/` directory contains GLB files
- Check browser console for loading errors

**CORS Issues:**
- API proxy handles CORS automatically
- Verify API calls use `/api/proxy` endpoint

### 7. Performance Optimization

The project includes:

- **Code splitting** - Vendor and Three.js bundles separated
- **Asset optimization** - 3D models and textures compressed
- **CDN delivery** - Static assets served via Vercel Edge Network
- **Serverless functions** - API calls handled efficiently

### 8. Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Project Structure

```
llm-avatar-chat/
├── api/
│   └── proxy.js          # Serverless API proxy
├── public/
│   └── models/           # 3D avatar models
├── src/
│   ├── components/       # React components
│   └── services/         # API services
├── vercel.json           # Vercel configuration
├── vite.config.ts        # Vite build config
└── .vercelignore         # Deployment exclusions
```

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review Vercel function logs
- Test locally with `npm run build && npm run preview`

---

**Ready to deploy!** 🚀 Your LLM Avatar Chat app is configured for Vercel hosting.