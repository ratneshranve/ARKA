/**
 * Creates or updates the single admin account from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD.
 * Usage: npm run seed:admin
 */
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Admin } from '../src/models/Admin.js';
import { passwordPolicy } from '../src/modules/common.validation.js';
import { hashPassword } from '../src/modules/auth/auth.service.js';

async function run() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  if (!email || !env.ADMIN_PASSWORD) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    process.exit(1);
  }
  const check = passwordPolicy.safeParse(env.ADMIN_PASSWORD);
  if (!check.success) {
    console.error(`❌ ADMIN_PASSWORD: ${check.error.issues[0].message}`);
    process.exit(1);
  }

  await connectDB();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const existing = await Admin.findOne();
  if (existing) {
    existing.name = env.ADMIN_NAME;
    existing.email = email;
    existing.passwordHash = passwordHash;
    existing.passwordChangedAt = new Date();
    existing.failedLoginAttempts = 0;
    existing.lockUntil = undefined;
    existing.refreshTokens = [];
    await existing.save();
    console.log(`✅ Admin updated: ${email}`);
  } else {
    await Admin.create({ name: env.ADMIN_NAME, email, passwordHash });
    console.log(`✅ Admin created: ${email}`);
  }
  console.log('   Log in at /admin/login and change the password after the first login.');
  await disconnectDB();
}

run().catch(async (err) => {
  console.error('❌ seed-admin failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
