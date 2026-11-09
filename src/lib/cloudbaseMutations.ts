import { cloudbaseDb } from './cloudbase';

export async function upsertCloudBaseProfile(id:string|undefined, row:Record<string,unknown>){
  if(id){ await cloudbaseDb.collection('profiles').doc(id).update(row); return id; }
  const result=await cloudbaseDb.collection('profiles').add(row); return result.id;
}
export async function upsertCloudBaseWork(id:string|undefined, row:Record<string,unknown>){
  if(id){ await cloudbaseDb.collection('works').doc(id).update(row); return id; }
  const result=await cloudbaseDb.collection('works').add(row); return result.id;
}
export async function deleteCloudBaseWork(id:string){ await cloudbaseDb.collection('works').doc(id).remove(); }
