import cloudbase from '@cloudbase/js-sdk';

const envId = (import.meta.env.VITE_CLOUDBASE_ENV_ID as string | undefined) || 'suihua-portfolio-d3e9qkk7f41ae3d';
export const cloudbaseApp = cloudbase.init({ env: envId });
export const cloudbaseAuth = cloudbaseApp.auth();
export const cloudbaseDb = cloudbaseApp.database();
export const cloudbaseStorage = cloudbaseApp.uploadFile;
