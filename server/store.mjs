import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export const dataDir = resolve(process.env.DATA_DIR || '.data');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
export const db = new DatabaseSync(resolve(dataDir, 'observatory.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS works (id TEXT PRIMARY KEY,category TEXT NOT NULL,zh TEXT NOT NULL,en TEXT NOT NULL DEFAULT '{}',published INTEGER NOT NULL DEFAULT 0,translation_status TEXT NOT NULL DEFAULT 'missing',sort_order INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY,salt TEXT NOT NULL,hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
`);
export function hashPassword(password, salt = randomBytes(16).toString('hex')) { return { salt, hash: scryptSync(password, salt, 64).toString('hex') }; }
export function verifyPassword(password, user) { if (!user) { scryptSync(password, 'dummy-salt-for-timing',64); return false; } const a=Buffer.from(hashPassword(password,user.salt).hash,'hex'), b=Buffer.from(user.hash,'hex'); return a.length===b.length && timingSafeEqual(a,b); }
export function getSettings() { const row=db.prepare('SELECT value FROM settings WHERE key=?').get('profile'); return row?JSON.parse(row.value):{}; }
export function saveSettings(value) { db.prepare('INSERT OR REPLACE INTO settings VALUES (?,?)').run('profile',JSON.stringify(value)); }
export function decodeWork(row) { return {...row,zh:JSON.parse(row.zh),en:JSON.parse(row.en),published:!!row.published}; }
if (!db.prepare('SELECT 1 FROM settings LIMIT 1').get()) {
 saveSettings({name:'绥化',nameEn:'Suihua',role:'游戏策划 / 叙事策划',roleEn:'Game & Narrative Designer',bio:'在游戏、图像与文字之间，探索尚未被命名的世界。',bioEn:'Exploring unnamed worlds through games, images, and words.',quote:'比金钱更珍贵的是知识，比知识更珍贵的是无休止的好奇心，而比好奇心更珍贵的，是我们头上的星空。',quoteEn:'More precious than money is knowledge; more precious than knowledge is endless curiosity; and more precious than curiosity is the starry sky above us.',email:'',wechat:'',experience:'',games:'',campus:'',skills:'',experienceEn:'',gamesEn:'',campusEn:'',skillsEn:'',profileTranslationStatus:'draft'});
 db.prepare('INSERT INTO works VALUES (?,?,?,?,?,?,?,?)').run('above-babel','games',JSON.stringify({title:'巴别塔之上',subtitle:'个人独立制作 · 游戏 Demo',summary:'从世界观构思到引擎落地，一次完整的独立创作。',body:'《巴别塔之上》是我独立制作的游戏 Demo。\n\n我负责剧情与世界观构思、角色立绘、实拍并渲染场景背景，以及使用游戏引擎将作品落地。\n\n世界观与剧情\n以架空未来世界为背景，围绕巴别塔展开人物关系与故事。\n\n视觉表达\n角色立绘与实拍渲染背景相结合，黑白画面中保留局部色彩。\n\n实现与复盘\n后续将在此补充设计文档、实现过程及迭代记录。',contribution:'世界观 / 剧情 / 角色立绘 / 实拍背景 / 背景渲染 / 引擎实现',year:'',engine:'',cover:'',gallery:[],video:'',link:'',demo:''}), '{}',1,'missing',0,new Date().toISOString());
}
