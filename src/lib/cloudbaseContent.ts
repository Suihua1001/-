import { cloudbaseDb } from './cloudbase';

export async function readCloudBaseContent(){
  const profiles = await cloudbaseDb.collection('profiles').get();
  const works = await cloudbaseDb.collection('works').where({published:true}).orderBy('sort_order','asc').get();
  return { profile: profiles.data?.[0] || null, works: works.data || [] };
}

export async function readCloudBaseAdminContent(){
  const profiles = await cloudbaseDb.collection('profiles').get();
  const works = await cloudbaseDb.collection('works').orderBy('sort_order','asc').get();
  return { profile: profiles.data?.[0] || null, works: works.data || [] };
}
