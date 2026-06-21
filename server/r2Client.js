import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
export const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'mvgr-materials-pdfs';

export function validateR2Env() {
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'Missing Cloudflare R2 environment variables. Required: CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME'
    );
  }
}

const r2Config = {
  region: 'auto',
  endpoint: endpoint || 'https://dummy.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: accessKeyId || 'dummy',
    secretAccessKey: secretAccessKey || 'dummy',
  },
  forcePathStyle: true,
};

const rawS3Client = new S3Client(r2Config);

export const s3Client = new Proxy(rawS3Client, {
  get(target, prop) {
    if (prop === 'send') {
      validateR2Env();
    }
    return target[prop];
  }
});
