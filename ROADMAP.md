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

## Future Scope (Planned)

### Short-Term (AI Integration Phases)
* **Phase 13.1**: Memory-efficient R2 PDF Plain Text parsing with text crop limits.
* **Phase 13.2**: Cache-first (Firestore lookup) PDF Summarizer and MVGR-aligned Question Generator.
* **Phase 13.3**: Usage Monitoring & Per-User Daily Rate Limiters.
* **Phase 13.4**: Lecture Short Notes and Key Glossary Terms Extractors.
* **Phase 14**: Context-bounded Material Chatbot & Exam Paper Guidelines Helper.
* **Phase 14.1**: Multi-turn Cost-Controlled Mini Study Assistant.
* **Phase 15**: Multi-User AI Privacy, Cost Performance, and Final Prompt Injection Audits.

### Mid-Term
* **Advanced Reports**: Comprehensive faculty & admin dashboard with detailed academic activity insights.
* **Bulk Data Operations**: Secure API endpoints for bulk user/material imports with strict validation.
* **Web Push Notifications**: Automatic alerts for new material uploads and exam preparation updates.

### Long-Term
* **Integrations**: LMS (Learning Management System) integrations.
* **Adaptive Learning**: Personalized material recommendations based on student preferences and performance.
