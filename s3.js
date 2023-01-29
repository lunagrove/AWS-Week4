const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {  getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

async function uploadImage(imageBuffer, imageName, mimetype) {
    // Create params that the S3 client will use to upload the image
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: imageBuffer,
      ContentType: mimetype
    }
  
    // Upload the image to S3
    const command = new PutObjectCommand(params)
    const data = await s3Client.send(command)
  
    return data
}

async function getUrlSigned(fileName) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })

  return signedUrl
}

async function deleteImages(fileName) {
  // Create params that the S3 client will use to delete the image

  const params = {
    Bucket: bucketName,
    Key: fileName
  }

  // Delete the image from S3
  const command = new DeleteObjectCommand(params)
  const data = await s3Client.send(command)

  const params1 = {
    Bucket: bucketName,
    Key: fileName + "_small"
  }

  // Delete the image from S3
  const command1 = new DeleteObjectCommand(params1)
  const data1 = await s3Client.send(command1)

  const params2 = {
    Bucket: bucketName,
    Key: fileName + "_grayscale"
  }

  // Delete the image from S3
  const command2 = new DeleteObjectCommand(params2)
  const data2 = await s3Client.send(command2)

  return data
}

module.exports = {
    uploadImage,
    getUrlSigned,
    deleteImages
  };