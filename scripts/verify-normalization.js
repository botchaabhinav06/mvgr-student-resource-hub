
import { adminDb } from '../server/firebaseAdmin.js';

async function verify() {
  console.log("--- START VERIFICATION ---");
  console.log("Verifying users...");
  const users = await adminDb.collection('users').limit(2).get();
  users.forEach(doc => {
    console.log(`User ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
  });

  console.log("\nVerifying materials...");
  const materials = await adminDb.collection('materials').limit(2).get();
  materials.forEach(doc => {
    console.log(`Material ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
  });
  console.log("--- END VERIFICATION ---");
}

verify().catch(console.error);
