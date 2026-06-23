# Deployment Guide - MVGR Student Resource Hub

This guide covers the deployment process for the MVGR Student Resource Hub.

## Infrastructure Overview

The application is a full-stack web app:
* **Frontend/Backend Web**: Deployed on Vercel.
* **Storage Layer**: Cloudflare R2 for all PDF assets.
* **Auth/Database**: Google Firebase (Auth & Firestore).

## Deployment Requirements

### 1. Environment Variables (.env)
You must configure these in your deployment platform (Vercel) dashboard:

```env
# Frontend
VITE_API_BASE_URL=https://your-backend-api-url.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_msg_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend Server Secrets
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account
CLOUDFLARE_R2_ACCOUNT_ID=your_r2_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_R2_PUBLIC_BASE_URL= # Optional: only needed if using public/custom R2 URLs
```

### 2. Deployment Steps

1. **Frontend/Serverless**: Connect your GitHub repository to Vercel.
2. **Configuration**: Set the environment variables listed above in Vercel.
3. **Build Command**: `vite build`
4. **Deploy**: Trigger a production build.

## Troubleshooting Checklist

* **Environment Variables**: Ensure all required variables are correctly set on Vercel.
* **Firebase Config**: Verify Firestore and Auth are enabled and correctly configured in the Firebase Console.
* **Cloudflare R2**: Ensure the configured R2 bucket is accessible by the backend and CORS is set up if needed.
* **Cold Starts**: Render (if using dedicated server) may have cold start times; Vercel is generally instant.

## Health Checks
* Production API Base URL: `https://...`
* Status: Live
