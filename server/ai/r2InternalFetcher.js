import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName, validateR2Env } from '../r2Client.js';

/**
 * Helper to convert an AWS SDK v3 stream response to a standard Node Buffer.
 * 
 * @param {ReadableStream} stream 
 * @returns {Promise<Buffer>}
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Downloads a PDF file internally from the private R2 bucket and returns it as a Buffer.
 * Does not expose any public or pre-signed URLs.
 * 
 * @param {string} storagePath - Validated key/path inside the bucket.
 * @returns {Promise<Buffer>} Binary buffer of the PDF file.
 */
export async function fetchR2ObjectAsBuffer(storagePath) {
  try {
    validateR2Env();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: storagePath
    });

    const response = await s3Client.send(command);

    if (!response || !response.Body) {
      throw new Error('Cloudflare R2 returned an empty body response.');
    }

    const buffer = await streamToBuffer(response.Body);
    return buffer;
  } catch (error) {
    console.error(`[R2 Internal Fetch Error] Failed downloading storage path: ${storagePath}`, error.message);
    throw new Error(`R2 Internal Retrieval Failed: ${error.message}`);
  }
}
