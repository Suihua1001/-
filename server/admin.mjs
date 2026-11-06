import { db, dataDir, hashPassword } from './store.mjs';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
if (db.prepare('SELECT 1 FROM admins WHERE username=?').get('suihua') && !process.argv.includes('--reset') && process.env.ADMIN_RESET !== 'true') { console.log('Admin already exists; keeping current credentials. Use --reset only to intentionally replace them.'); process.exit(0); }
const password=process.env.ADMIN_INITIAL_PASSWORD || randomBytes(24).toString('base64url');
if (password.length < 12 || password.length > 256) throw new Error('ADMIN_INITIAL_PASSWORD must be 12-256 characters');
const {salt,hash}=hashPassword(password);
db.prepare('INSERT OR REPLACE INTO admins VALUES (?,?,?)').run('suihua',salt,hash);
db.prepare('DELETE FROM sessions').run();
const path=resolve(dataDir,'initial-admin.txt');
writeFileSync(path,`Username: suihua\nPassword: ${password}\n`,{mode:0o600});
console.log(`Admin credentials generated in ${path}. Read this file privately; do not commit or share it. You can change the password in the admin panel.`);
