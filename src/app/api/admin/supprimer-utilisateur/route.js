import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey
        .replace(/^"/, '')
        .replace(/"$/, '')
        .replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: 'UID manquant' }, { status: 400 });

    // Supprimer de Firebase Auth (si le compte existe)
    try {
      await adminAuth.deleteUser(uid);
    } catch (authErr) {
      // Si l'utilisateur n'existe pas dans Auth, on continue quand même
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr;
      }
    }

    // Supprimer de Firestore dans tous les cas
    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}