const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

exports.getFileUrl = async (key, download = false, fileName = '') => {
  if (!bucketName) return '';
  const params = {
    Bucket: bucketName,
    Key: key
  };
  if (download && fileName) {
    params.ResponseContentDisposition = `attachment; filename="${fileName}"`;
  }
  const command = new GetObjectCommand(params);
  // URL expires in 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

/**
 * Uploads a file buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {String} mimetype - File mime type
 * @param {String} originalname - Original file name
 * @param {String} folder - S3 folder prefix (default: 'attachments')
 * @returns {Promise<{ url: String, key: String }>}
 */
exports.uploadFile = async (buffer, mimetype, originalname, folder = 'attachments') => {
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  // Sanitize filename and create unique key
  const sanitizedName = originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const key = `${folder}/${timestamp}-${uuid}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    // Optional: add ContentDisposition if you want files to download automatically
    // ContentDisposition: `attachment; filename="${sanitizedName}"`
  });

  await s3Client.send(command);

  // Construct the presigned URL
  const url = await exports.getFileUrl(key);

  return { url, key };
};

/**
 * Deletes a file from S3
 * @param {String} key - S3 object key
 */
exports.deleteFile = async (key) => {
  if (!bucketName) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.error(`Failed to delete S3 object ${key}:`, err);
    // We might not want to fail the whole request if S3 delete fails (e.g., if file doesn't exist)
  }
};
