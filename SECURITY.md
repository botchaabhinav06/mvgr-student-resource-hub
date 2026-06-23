# Security & Access Policy - MVGR Student Resource Hub

Security is a fundamental component of the MVGR Student Resource Hub. This document outlines the security architecture and access policies in place.

## Access Policy Overview

The application enforces role-based access control (RBAC).

| Action | Student | Faculty | Admin |
| :--- | :--- | :--- | :--- |
| **Material View/Browse** | Same dept | Same/All dept | All |
| **Material Upload** | X | Yes | Yes |
| **Material Delete** | X | Own only | All |
| **Profile Edit** | Year/Sem | Limited | All fields |
| **User Mgmt** | X | X | Yes |

### 1. Student Restrictions
* Students can **only** browse and download materials from their own department.
* Students **cannot** edit their Department; this is locked to maintain data integrity.

### 2. Backend Signed URL Security
* The backend enforces strict validation when generating signed URLs for R2 assets:
    * Firebase ID token authentication is mandatory.
    * The user must have a valid, active profile.
    * The requested material must exist and be active.
    * **Department Matching**: A student's department must match the material's department.
    * **Storage Path Validation**: The backend validates that the requested storage path matches the record in Firestore precisely.

### 3. Data Protection
* **Cloudflare R2**: Credentials are stored as server-side environment variables and are never exposed to the client.
* **Firestore**: Security rules are configured to restrict read/write access based on the user's authenticated `uid` and `role`.
* **PII/Secrets**: No secrets are committed to the repository. All environment configuration uses placeholders in public documentation.

## Known Risks & Future Improvements
* **Advanced Reports**: Currently, reporting is basic; advanced analytics might need PII data filtering.
* **Bulk Import**: Currently not supported to prevent uncontrolled data ingestion. When implemented, it will require rigorous validation.
