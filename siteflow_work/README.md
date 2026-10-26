# SiteFlow — Construction Operations Platform

Single-company, multi-project construction platform with an Android field app and a management web portal.

## Repository layout
- `src/` — existing React + Vite web prototype. Retain as a starting point for the management portal; it is not production-ready.
- `apps/mobile/` — initial Expo Router / React Native Android foundation.
- `functions/` — trusted Firebase Cloud Functions, including an employee invitation baseline.
- `firestore.rules`, `storage.rules` — security baseline; review and test before deployment.
- `firestore.indexes.json`, `firebase.json` — Firebase deployment configuration.
- `docs/ARCHITECTURE.md` — modules, data model, workflows and rollout plan.

## Critical Firebase ownership notice
Do not use the Firebase project previously bundled with the AI Studio prototype for company data. It is not confirmed to be owned by the company. Create a new Firebase project under a company-controlled Google account. No real employee or project data should be entered until rules, authentication, App Check, backups and access policies are tested.

## Start the mobile shell
1. Install Node.js LTS.
2. `cd apps/mobile && npm install`
3. Run `npx expo install --fix` to align native package versions with the selected Expo SDK.
4. Copy `.env.example` to `.env`; add the new company Firebase app settings when ready.
5. `npx expo start`
6. Scan the QR code with Expo Go on Android.

The current screen is a UI foundation only; it does not yet authenticate or display live company data.

## Firebase setup
1. Create a new company-owned Firebase project.
2. Enable Authentication, Firestore, Storage, Cloud Functions and App Check.
3. Register separate Android and web apps.
4. Deploy reviewed rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
5. Build and deploy functions: `cd functions && npm install && npm run build`, then from root `firebase deploy --only functions`.
6. Provision the first `company_admin` using a one-time trusted Admin SDK bootstrap process. Never put service-account credentials in an app or Git repository.
7. Test in Firebase Emulator Suite before loading any company data.

## Production safeguards
The original web prototype includes demo personas and seeded sample construction data. Its role switcher is not authentication. Do not use the prototype with real company data until it has been migrated to authenticated, company-scoped repositories and tested against the security rules. The invitation function currently returns a password-reset link to the authorized inviter; connect an approved transactional email provider before production and distribute links securely. Add emulator tests, MFA for privileged users, App Check, backup/retention policies, audit monitoring, privacy policies and billing alerts before rollout.
