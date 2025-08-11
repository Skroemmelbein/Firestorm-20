# Cloudflare Pages Deployment Guide

## Overview
This guide explains how to deploy the ECHELONX platform to Cloudflare Pages with automatic GitHub Actions deployment.

## Prerequisites

### 1. Cloudflare Account Setup
- Create a Cloudflare account at https://cloudflare.com
- Get your Account ID from the Cloudflare dashboard sidebar
- Generate an API token with the following permissions:
  - Zone:Zone:Read
  - Zone:Page Rules:Edit
  - Account:Cloudflare Pages:Edit

### 2. GitHub Secrets Configuration
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### 3. Environment Variables for Production
Add these environment variables in Cloudflare Pages dashboard:

```
NODE_ENV=production
XANO_API_KEY=your_xano_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
NMI_USERNAME=your_nmi_username
NMI_PASSWORD=your_nmi_password
OPENAI_API_KEY=your_openai_key
```

## Deployment Process

### Automatic Deployment
1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Build the frontend application
   - Deploy to Cloudflare Pages
   - Deploy API to Cloudflare Workers (optional)

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy using Wrangler CLI
npm run deploy
```

## Architecture

### Frontend (Cloudflare Pages)
- **URL**: `https://echelonx-platform.pages.dev`
- **Build Command**: `npm run build:client`
- **Output Directory**: `dist`
- **Framework**: React + Vite

### Backend API (Cloudflare Workers)
- **URL**: `https://echelonx-api-production.your-subdomain.workers.dev`
- **Entry Point**: `server/node-build.ts`
- **Runtime**: Node.js compatible

## Custom Domain Setup

### 1. Add Custom Domain in Cloudflare Pages
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to "Custom domains" tab
4. Add your domain (e.g., `app.yourdomain.com`)

### 2. Update DNS Records
Add a CNAME record pointing to your Pages deployment:
```
CNAME app echelonx-platform.pages.dev
```

### 3. Update API Redirects
Edit `_redirects` file to point to your custom Workers domain:
```
/api/*  https://api.yourdomain.com/:splat  200
```

## Monitoring & Debugging

### Cloudflare Analytics
- Real-time traffic analytics
- Performance metrics
- Error tracking

### GitHub Actions Logs
- Build process monitoring
- Deployment status
- Error diagnostics

### Cloudflare Workers Logs
- API request monitoring
- Runtime error tracking
- Performance metrics

## Security Features

### Headers Configuration
The `_headers` file includes:
- XSS protection
- Content type validation
- Frame options security
- CORS configuration for API routes

### Environment Variables
- All sensitive data stored as encrypted secrets
- No credentials exposed in repository
- Production/staging environment separation

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in GitHub Actions

2. **API Connection Issues**
   - Verify environment variables are set
   - Check CORS configuration
   - Validate API endpoint URLs

3. **Deployment Failures**
   - Confirm Cloudflare API token permissions
   - Verify account ID is correct
   - Check project name matches configuration

### Support Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
