import cloudbase from '@cloudbase/js-sdk';
import {generatePGClient} from '@cloudbase/wx-cloud-client-sdk';

const envId = (import.meta.env.VITE_CLOUDBASE_ENV_ID as string | undefined) || 'suihua-portfolio-d3e9qkk7f41ae3d';
export const cloudbaseApp = cloudbase.init({ env: envId });
export const cloudbaseAuth = cloudbaseApp.auth();
export const cloudbasePg = generatePGClient(cloudbaseApp)({schema:'public'});
export const cloudbaseStorage = cloudbaseApp.uploadFile;
