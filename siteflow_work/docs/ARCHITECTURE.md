# SiteFlow — Production Architecture

## Product definition
Single construction company, multiple concurrent projects, one authoritative data platform.
- Android field application: Expo + React Native + TypeScript.
- Management portal: React + Vite + TypeScript (the existing web interface is a prototype to be migrated, not production-ready).
- Backend: Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions and Firebase Cloud Messaging.
- Every operational record is scoped below `companies/{companyId}`.

## Core principles
1. One employee identity per person; project access is granted separately from job role.
2. Role grants a capability ceiling; project and department membership further restrict data access.
3. Chats are collaboration records, not approvals. Formal records (requisitions, purchase orders, site instructions, incident reports) have their own status, owner, timestamps and audit trail.
4. No client-side role switcher in production. Permissions are checked in Firestore/Storage Rules and trusted Cloud Functions.
5. Demo records are never automatically written into a production Firebase project.
6. Field workflows support offline drafts and explicit sync state; unsynced reports must never be silently discarded.
7. Financial and safety actions are auditable and use separation of duties.

## Main modules
- Company administration: company profile, departments, employees, invitations, role/permission assignment.
- Projects: project register, project members, milestones, schedule, status and progress.
- Communication: company announcements, project channels, department channels, direct messages, attachments, read receipts and message-to-record conversion.
- Site operations: tasks, daily site reports, labour attendance, inspections, site instructions, RFIs, non-conformance and safety incidents.
- Commercial: BOQ/budget, material requisitions, supplier quotations, purchase orders, delivery notes, invoices, expenses and payment approvals.
- Documents: drawings, specifications, contracts, permits, revisions, access rules and acknowledgement.
- Reporting: project health, schedule variance, cost variance, labour, procurement ageing and safety metrics.
- Client portal: explicitly invited external users with read-only, project-scoped visibility.

## Firestore data model
All paths below are under `companies/{companyId}/`:
- `profile` — company settings, timezone and currency.
- `users/{uid}` — employee identity, status, role, departmentIds, jobTitle, phone, employeeNumber, createdBy and timestamps.
- `departments/{departmentId}` — name, code, managerUid and active.
- `projects/{projectId}` — name, code, location, client, status, dates, budget summary and createdBy.
- `projectMembers/{uid_projectId}` — uid, projectId, accessLevel, departmentId and active.
- `channels/{channelId}` — type (`company|project|department`), projectId?, departmentId?, memberUids, title and createdBy.
- `channels/{channelId}/messages/{messageId}` — senderUid, body, attachmentRefs, createdAt, editedAt and optional linkedRecordType/linkedRecordId.
- `tasks/{taskId}` — projectId, departmentId, assigneeUid, title, description, priority, status, dueAt and createdBy.
- `dailyLogs/{logId}` — projectId, authorUid, workDate, weather, crew, workDone, issues, photoRefs, submittedAt and status.
- `attendance/{entryId}` — projectId, workDate, employeeUid, attendanceStatus, recordedBy and recordedAt.
- `materials/{materialId}` — projectId, itemCode, description, unit, onHand and reorderLevel.
- `requisitions/{requisitionId}` — projectId, departmentId, requestedBy, items, justification, status and approvalSteps.
- `purchaseOrders/{poId}` — projectId, supplierId, requisitionId, lines, totals, status and approvedBy.
- `suppliers/{supplierId}` — company supplier register.
- `expenses/{expenseId}` — projectId, category, amountMinor, currency, vendorId, invoiceRef, recordedBy and status.
- `documents/{documentId}` — projectId, title, category, storagePath, revision, uploadedBy, visibility and status.
- `incidents/{incidentId}` — projectId, reportedBy, category, severity, description, photoRefs, status and assignedTo.
- `approvals/{approvalId}` — projectId, recordType, recordId, requestedBy, approverUid, status, decisionNote and decidedAt.
- `auditLogs/{eventId}` — actorUid, action, entityType, entityId, optional projectId, before/after summary and createdAt.

Use server timestamps. Store money as integer minor units plus ISO currency code (KES for the Kenya deployment after company confirmation), never floating-point amounts.

## Suggested roles
`company_admin`, `director`, `project_manager`, `site_engineer`, `site_supervisor`, `quantity_surveyor`, `procurement_officer`, `storekeeper`, `finance_officer`, `hse_officer`, `hr_admin`, `subcontractor`, `client_viewer`.

Roles are not sufficient by themselves: project membership, department membership, record ownership and approval separation must also be checked. Subcontractors and clients only see explicitly assigned records.

## Key workflows
### Employee onboarding
Company Admin/HR creates invitation -> trusted function creates Auth identity and profile -> employee sets password from email link -> manager assigns department/project memberships -> user signs in with scoped access.

### Message to formal requisition
Department message -> authorized user creates requisition linked to message -> draft -> submitted for approval -> independent approver approves/rejects -> procurement issues PO -> goods receipt updates stock -> transitions are audited. A chat message is never itself an approval or purchase order.

### Daily site report
Supervisor saves offline draft -> attaches photos -> syncs -> submits -> PM reviews -> approved report contributes to reporting. Corrections create revisions instead of silently overwriting approved history.

## Security and operations checklist
- Create a new Firebase project owned by the construction company.
- Enable Authentication, Firestore, Storage, Functions and App Check.
- Deploy supplied rules before importing any real data; test them in Firebase Emulator Suite.
- Provision the first company administrator through a one-time trusted Admin SDK bootstrap process. Never expose a public bootstrap endpoint.
- Require MFA for company admins and finance approvers where feasible.
- Use least-privilege IAM, billing alerts, backups/PITR, retention policies and incident-response contacts.
- Never commit service-account keys or private credentials.
- Configure FCM and Android platform credentials.
- Define privacy, retention, employee monitoring, client access and data export policies before rollout.

## Delivery sequence
1. Firebase ownership, environment and security baseline.
2. Authentication, employee invitation, company/department/project membership.
3. Android shell and management portal sign-in.
4. Channels and messaging.
5. Tasks, daily logs, photos, attendance and offline sync.
6. Materials, requisitions, procurement and approvals.
7. Documents, finance and reporting.
8. Pilot on one project, improve field usability, then expand to all sites.
