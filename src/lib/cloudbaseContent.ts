import {cloudbasePg,ensureCloudbaseAccessToken} from './cloudbase';
import type {Profile,SiteContent,Work,WorkContent} from '../types';

const categories=new Set(['games','design','art','writing']);
const text=(value:unknown)=>value==null?'':String(value);
const blankProfile:Profile={name:'',nameEn:'',role:'',roleEn:'',bio:'',bioEn:'',quote:'',quoteEn:'',email:'',wechat:'',experience:'',games:'',campus:'',skills:'',experienceEn:'',gamesEn:'',campusEn:'',skillsEn:'',profileTranslationStatus:'draft',personal_info:'',education:'',projects:'',resumeRaw:''};
const jsonArray=(value:unknown):string[]=>{
  if(Array.isArray(value))return value.map(text).filter(Boolean);
  if(typeof value==='string'&&value.trim()){
    try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed.map(text).filter(Boolean):[];}catch{return value.split(',').map(v=>v.trim()).filter(Boolean);}
  }
  return [];
};
const iso=(value:unknown)=>value instanceof Date?value.toISOString():text(value);

export function profileFromPostgres(row:Record<string,unknown>|null|undefined):Profile|null{
  if(!row)return null;
  return {
    id:text(row.id)||undefined,
    name:text(row.name),nameEn:text(row.name_en),role:text(row.role),roleEn:text(row.role_en),
    bio:text(row.bio),bioEn:text(row.bio_en),quote:text(row.quote),quoteEn:text(row.quote_en),
    email:text(row.email),wechat:text(row.wechat),
    experience:text(row.experience),games:text(row.games),campus:text(row.campus),skills:text(row.skills),
    experienceEn:text(row.experience_en),gamesEn:text(row.games_en),campusEn:text(row.campus_en),skillsEn:text(row.skills_en),
    profileTranslationStatus:text(row.profile_translation_status)||'draft',
    personal_info:text(row.personal_info),education:text(row.education),projects:text(row.projects),
    resumeRaw:text(row.resume_raw)
  };
}

const empty:WorkContent={title:'',subtitle:'',summary:'',body:'',contribution:'',year:'',engine:'',cover:'',gallery:[],video:'',link:'',demo:''};
function contentFromRow(row:Record<string,unknown>,suffix=''):WorkContent{
  return {
    title:text(row[`title${suffix}`]),subtitle:text(row[`subtitle${suffix}`]),summary:text(row[`summary${suffix}`]),
    body:text(row[`body${suffix}`]),contribution:text(row[`contribution${suffix}`]),year:text(row.year),engine:text(row.engine),
    cover:text(row.cover_url),gallery:jsonArray(row.gallery_urls),video:text(row.video_url),link:text(row.project_url),demo:text(row.demo_url)
  };
}
export function workFromPostgres(row:Record<string,unknown>,includeDraftEnglish=true):Work{
  const status=text(row.translation_status)||'missing';
  const en=includeDraftEnglish||status==='approved'?contentFromRow(row,'_en'):empty;
  return {
    id:text(row.id),category:categories.has(text(row.category))?text(row.category) as Work['category']:'games',
    zh:contentFromRow(row),en,published:Boolean(row.published),translation_status:status,
    sort_order:Number(row.sort_order)||0,updated_at:iso(row.updated_at)
  };
}

async function rows(table:string,query:(q:any)=>any){
  const result=await query(cloudbasePg.from(table));
  if(result.error)throw new Error(result.error.message||`读取 ${table} 失败`);
  return (result.data||[]) as Record<string,unknown>[];
}

export async function readCloudBaseContent():Promise<SiteContent>{
  await ensureCloudbaseAccessToken();
  const profiles=await rows('profiles',q=>q.select('*').order('updated_at',{ascending:false}).limit(1));
  const works=await rows('works',q=>q.select('*').eq('published',true).order('sort_order',{ascending:true}));
  return {profile:profileFromPostgres(profiles[0]) as Profile,works:works.map(row=>workFromPostgres(row,false))};
}

export async function readCloudBaseAdminContent():Promise<SiteContent>{
  await ensureCloudbaseAccessToken();
  const profiles=await rows('profiles',q=>q.select('*').order('updated_at',{ascending:false}).limit(1));
  const works=await rows('works',q=>q.select('*').order('sort_order',{ascending:true}));
  return {profile:profileFromPostgres(profiles[0])||blankProfile,works:works.map(row=>workFromPostgres(row,true))};
}
