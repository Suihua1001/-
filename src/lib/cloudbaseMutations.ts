import {cloudbasePg} from './cloudbase';

function fail(error:any,action:string):never{throw new Error(error?.message||`${action}失败`);}

export async function upsertCloudBaseProfile(id:string|undefined,row:Record<string,unknown>){
  const payload={...row,...(id?{id}:{}),updated_at:row.updated_at||new Date().toISOString()};
  const result=await cloudbasePg.from('profiles').upsert(payload,{onConflict:'id'}).select('id').single();
  if(result.error)fail(result.error,'保存个人档案');
  return String((result.data as any)?.id||id||'');
}

export async function upsertCloudBaseWork(id:string|undefined,row:Record<string,unknown>){
  const payload={...row,...(id?{id}:{}),updated_at:row.updated_at||new Date().toISOString()};
  const result=await cloudbasePg.from('works').upsert(payload,{onConflict:'id'}).select('id').single();
  if(result.error)fail(result.error,'保存作品');
  return String((result.data as any)?.id||id||'');
}

export async function deleteCloudBaseWork(id:string){
  const result=await cloudbasePg.from('works').delete().eq('id',id);
  if(result.error)fail(result.error,'删除作品');
}
