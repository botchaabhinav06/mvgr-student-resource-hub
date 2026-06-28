# Project Roadmap - MVGR Student Resource Hub

## Completed Phases
- ✅ **Infrastructure**: Firebase Auth + Firestore setup completed.
- ✅ **Storage**: Cloudflare R2 integration for secure PDF hosting.
- ✅ **Student Features**: Browsing, filtering, previewing, and downloading materials.
- ✅ **Faculty Features**: Upload, management, and deletion controls.
- ✅ **Admin Tools**: User management, database diagnostics, and normalization.
- ✅ **UX Polish**: Production-ready interface, dark theme optimization, and responsive design.
- ✅ **Security Audit**: Role-based access control and backend signed-URL hardening.
- ✅ **Phase 12 (AI Planning & Architecture Freeze)**: Completed secure planning, costs matrix modeling, and role-based endpoints freeze (see `AI_ARCHITECTURE_PLAN.md`).
- ✅ **Phase 12.1**: Student, Faculty, and Admin UI Sidebar Navigation & Assistant View Skeletons integrated.
- ✅ **Phase 13**: Node/Express Backend Gemini LLM Integration Foundation with lazy SDK client.
- ✅ **Phase 13.0A/B**: Admin-only AI Smoke Test panel with model-configurable environment overrides & fallback retry loop.
- ✅ **Phase 13.1**: Secure memory-efficient R2 PDF text extraction with heuristic quality checks and quality guard checks.
- ✅ **Phase 13.2**: Cache-first (Firestore lookup) PDF Summarizer and MVGR-aligned Question Generator MVP with full Student Assistant Workspace integration.
- ✅ **Phase 13.3**: Usage Monitoring & Per-User Daily Rate Limiters with live Daily AI Quota panels.
- ✅ **Phase 13.4**: AI Output History & Saved Results secure archive with strict access control and zero-quota viewing.
- ✅ **Phase 13.7**: Firestore Production Security Rules Lock down with zero-trust roles isolation.
- ✅ **Phase 13.7A**: Firestore Rules Hardening Patch to enforce department-scoped material read isolation, admin-only profile creation, owner-restricted profile updates, and secure context-locked material downloads.
- ✅ **Phase 13.6D**: Secure Forgot Password / Password Reset self-service flow with generic error handling and strict institutional email restrictions.
- ✅ **Phase 13.6D-1**: Forgot Password Email Validation Hotfix to support any registered email address (including personal accounts) while maintaining safe generic responses.

### Firebase Console Deployment Checklists
To ensure the password reset flow behaves correctly in production:
1. **Authentication → Templates**: Verify the "Password reset" email template layout and configure your custom sender domain/reply-to headers.
2. **Authentication → Settings → Authorized domains**: Ensure your custom Vercel or Cloud Run domain is listed as an authorized domain to allow safe popups/redirect flows.
3. **Sign-in Providers**: Ensure the Email/Password sign-in provider is enabled in the Firebase Auth console.

## Active Production AI Scope
- ✅ **PDF Summary**: Grounded, high-yield structured lecture summarization focusing on key takeaways.
- ✅ **Important Questions Generator**: Syllabus-grounded practice question worksheets (2M, 5M, 10M).
- ✅ **Short Notes Generator**: Clear, well-structured, scannable revision study outlines.
- ✅ **Key Terms & Definitions**: Glossary definitions, abbreviations, and formula extractions.
- ✅ **AI Output History**: Secure, quota-free viewing vault of previously generated study materials.
- ✅ **Quota & Cost Control**: Per-user daily role rate-limiting with live quota status tracking.
- ✅ **Admin AI Diagnostics**: Comprehensive backend telemetry, health smoke tests, and model discovery.

- ✅ **Phase 14**: Final Production Release Lock (Stable, fully secured, and validated for release).

## Removed / Deferred from Current Production UI (Not in Current Release Scope)
These features have been safely decoupled and deferred to ensure maximum cost control, extreme security against LLM hallucinations, and a clean, highly focused production MVP:
* **Material Q&A Chatbot**: (Deferred for future closed-circuit multi-turn context testing).
* **Question Paper Helper**: (Deferred to allow syllabus blueprint coordinate grounding optimization).
* **Faculty AI Tools Activation**: (Faculty sidebar AI tools links are deferred. The AI assistant is dedicated fully as a student revision aid).

## Future Scope (Planned)

### Short-Term
* **Phase 15**: Advanced prompt injection guards and IP-level request rate-limiting.
* **Phase 15.1**: Multi-turn Cost-Controlled Mini Study Assistant.

### Mid-Term
* **Advanced Reports**: Detailed analytics dashboard for faculty regarding students' study aid engagement levels.
* **Bulk Data Operations**: Secure API endpoints for bulk user/material imports with strict validation.

### Long-Term
* **LMS Integrations**: Seamless connections to standard university Learning Management Systems.
* **Adaptive Learning Paths**: Personalized recommendations of revision documents based on student query history.

