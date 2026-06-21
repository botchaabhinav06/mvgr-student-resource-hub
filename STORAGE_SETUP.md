# Cloudflare R2 Storage Lifecycle Configuration Codebase

This document details the configuration and operations of the storage backplane for the **MVGR Student Resource Hub**.

---

## 💾 Core Directory Architecture

Academic resources are stored in a secure **Cloudflare R2 Bucket**, mapped key-by-key in **Cloudfirst Metadata Documents (Firestore)**. Legacy resources from early development phases are housed under **Supabase Storage** and remain fully accessible for reading and downloading.

```
mvgr-materials-pdfs / (Cloudflare R2 Bucket Boundary)
├── materials/
│   └── [Department]/
│       └── [Year]/
│           └── [Semester]/
│               └── [Subject]/ (Optional)
│                   └── [Material_ID]/
│                       └── [Sanitized_Filename].pdf
└── test-uploads/
    └── [Timestamp]-[Sanitized_Filename].pdf
```

---

## 🔒 Security Standards

1. **Private Bucket Hardening**: The R2 bucket is locked to the outside world. No public URLs or read access coordinates are published.
2. **Short-Lived Presigned Tokens**: Accessing files is restricted to backend-generated presigned S3 URLs that expire exactly **300 seconds (5 minutes)** after dispatch.
3. **MIME-Type Lock**: Only legitimate PDF files (`application/pdf`) are permitted for upload on both test beds and core faculty endpoints.
4. **Path Traversal Shield**: The backend strictly guards against relative jumps (`../`, `..\\`) and prevents unauthorized storage paths outside `materials/` or `test-uploads/` boundaries.
5. **No Client-Exposed Secret Credentials**: Secret IAM keys, Cloudflare Account IDs, and bucket credentials exist solely in the backend runtime container. The React client only obtains short-lived pre-authorized download links.

---

## ⚙️ Backend Environment Variables

To run the storage backplane, define the following variables inside your hosting environment or a local `.env` file (ensure `.env` remains in `.gitignore`):

```env
# Cloudflare R2 Credentials
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_key"
CLOUDFLARE_R2_BUCKET_NAME="mvgr-materials-pdfs"
CLOUDFLARE_R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"

# Server Port
PORT=3000
```

---

## 🛰️ CORS Configuration for R2 Bucket

To permit seamless inline previews and download actions within the web browser or iframe sandboxes, the R2 bucket must be configured with a Cross-Origin Resource Sharing (CORS) rule:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type", "Content-Disposition"]
  }
]
```

---

## 🧪 Developer Playground Panel

An assembly-level developer sandbox has been built to test uploads and verify endpoint functionality directly at:
👉 **`/r2-test`**

- **Purpose**: Provides diagnostics for bucket connectivity and endpoint state checking.
- **Constraints**: Contains explicit warnings that it is a developer-only testbed and does not log references inside Firestore. It remains fully hidden from production navbar and dashboard routing blocks.
