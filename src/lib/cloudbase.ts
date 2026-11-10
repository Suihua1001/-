import cloudbase from '@cloudbase/js-sdk';
import {generatePGClient} from '@cloudbase/wx-cloud-client-sdk';

const envId = (import.meta.env.VITE_CLOUDBASE_ENV_ID as string | undefined) || 'suihua-portfolio-d3e9qkk7f41ae3d';
export const cloudbaseApp = cloudbase.init({ env: envId });
export const cloudbaseAuth = cloudbaseApp.auth();
const pgBaseUrl=`https://${envId}.api.tcloudbasegateway.com/v1/rdb/rest`;
async function pgFetch(input:RequestInfo|URL,init:RequestInit={}){
  const {accessToken}=await cloudbaseAuth.getAccessToken();
  const headers=new Headers(init.headers);
  headers.set('Authorization',`Bearer ${accessToken}`);
  return fetch(input,{...init,headers});
}
export const cloudbasePg = generatePGClient(cloudbaseApp,{pgBaseUrl,fetch:pgFetch})({schema:'public'});
export const cloudbaseStorage = cloudbaseApp.uploadFile;
export async function ensureCloudbaseAccessToken(){
  if(!cloudbaseAuth.hasLoginState())await cloudbaseAuth.signInAnonymously();
  return cloudbaseAuth.getAccessToken();
}
