import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const auth = getAuth();
const db = getFirestore();
const employeeRoles = new Set([
  'director', 'project_manager', 'site_engineer', 'site_supervisor', 'quantity_surveyor',
  'procurement_officer', 'storekeeper', 'finance_officer', 'hse_officer', 'hr_admin',
  'subcontractor', 'client_viewer'
]);

type InviteInput = {
  email: string; displayName: string; role: string; departmentIds?: string[];
  projectIds?: string[]; phone?: string; jobTitle?: string;
};

/** Only company_admin/hr_admin custom claims may create an employee identity. */
export const inviteEmployee = onCall({ enforceAppCheck: true, region: 'europe-west1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const claims = request.auth.token;
  const companyId = claims.companyId as string | undefined;
  const callerRole = claims.role as string | undefined;
  if (!companyId || !['company_admin', 'hr_admin'].includes(callerRole || '')) {
    throw new HttpsError('permission-denied', 'Only company administrators or HR can invite employees.');
  }
  const input = request.data as InviteInput;
  const email = String(input.email || '').trim().toLowerCase();
  const displayName = String(input.displayName || '').trim();
  const role = String(input.role || '');
  const departmentIds = Array.isArray(input.departmentIds) ? input.departmentIds : [];
  const projectIds = Array.isArray(input.projectIds) ? input.projectIds : [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || displayName.length < 2 || displayName.length > 100) {
    throw new HttpsError('invalid-argument', 'A valid email and employee name are required.');
  }
  if (!employeeRoles.has(role) || departmentIds.length > 10 || projectIds.length > 100) {
    throw new HttpsError('invalid-argument', 'Invalid role or too many assignments.');
  }

  let user;
  try {
    user = await auth.createUser({ email, displayName, phoneNumber: input.phone || undefined, disabled: false });
  } catch (error: any) {
    if (error?.code === 'auth/email-already-exists') throw new HttpsError('already-exists', 'An account already exists for this email.');
    throw new HttpsError('internal', 'Could not create employee account.');
  }

  try {
    await auth.setCustomUserClaims(user.uid, { companyId, role, accountStatus: 'active' });
    const userRef = db.doc(`companies/${companyId}/users/${user.uid}`);
    const batch = db.batch();
    batch.set(userRef, {
      uid: user.uid, email, displayName, role, departmentIds, projectIds,
      phone: input.phone || null, jobTitle: input.jobTitle || null,
      employmentStatus: 'active', invitedBy: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()
    });
    for (const projectId of projectIds) {
      batch.set(db.doc(`companies/${companyId}/projectMembers/${user.uid}_${projectId}`), {
        uid: user.uid, projectId, accessLevel: role === 'project_manager' ? 'manager' : 'member',
        active: true, assignedBy: request.auth.uid, createdAt: FieldValue.serverTimestamp()
      });
    }
    batch.set(db.collection(`companies/${companyId}/auditLogs`).doc(), {
      actorUid: request.auth.uid, action: 'employee.invited', entityType: 'user', entityId: user.uid,
      createdAt: FieldValue.serverTimestamp()
    });
    await batch.commit();
    // Return this link only to the authorized inviter; connect a transactional email provider before production.
    const inviteLink = await auth.generatePasswordResetLink(email);
    return { uid: user.uid, email, inviteLink };
  } catch (error) {
    await auth.deleteUser(user.uid).catch(() => undefined);
    throw new HttpsError('internal', 'Employee invitation could not be completed.');
  }
});
