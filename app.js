const express = require("express");
const database = require("./database");
const s3 = require("./s3");
const formatDateTime = require("./dates")

require('dotenv').config()
const crypto = require('crypto');
const sharp = require('sharp');

const app = express();

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use(express.static("public"));

app.get("/", async (req, res) => {

  images = await database.getImages()

  for (const image of images) {
    image.imageURL = await s3.getUrlSigned(image.file_name)
    image.imageDate = formatDateTime.formatDate(image.created) + " " +
                      formatDateTime.formatTime(image.created);
  }

  res.render("index", {images: images,
                       imageType: ""})
})

app.get("/:imgtype", async (req, res) => {

  let imageType = req.params.imgtype
  if (req.params.imgtype !== "small" && req.params.imgtype !== "grayscale") {
    imageType = ""
  }

  images = await database.getImages()

  for (const image of images) {
    let new_fileName = ""
    if (imageType === "") {
      image.imageURL = await s3.getUrlSigned(image.file_name)
    }
    if (imageType === "small") {
      new_fileName = image.file_name + "_small"
      image.imageURL = await s3.getUrlSigned(new_fileName)
    }
    if (imageType === "grayscale") {
      new_fileName = image.file_name + "_grayscale"
      image.imageURL = await s3.getUrlSigned(new_fileName)
    }
    
    image.imageDate = formatDateTime.formatDate(image.created) + " " +
                      formatDateTime.formatTime(image.created);

  }

  res.render("index", {images: images,
                       imageType: imageType })
})

app.post('/images/save', upload.single('image'), async (req, res) => {

  const description = req.body.description
  const fileBuffer = req.file.buffer
  const mimetype = req.file.mimetype
  const fileName = generateFileName()

  // Store the image in s3
  let s3Result = await s3.uploadImage(fileBuffer, fileName, mimetype)

  // Store the image in the database
  const result = await database.addImage(fileName, description)

  const sfileBuffer1 = await sharp(req.file.buffer)
  .resize({ height: 100, width: 100, fit: "contain" })
  .toBuffer();
  let new_fileName = fileName + "_small"
  s3Result = await s3.uploadImage(sfileBuffer1, new_fileName, mimetype)

  const sfileBuffer2 = await sharp(req.file.buffer)
  .grayscale()
  .toBuffer();
  new_fileName = fileName + "_grayscale"
  s3Result = await s3.uploadImage(sfileBuffer2, new_fileName, mimetype)

  res.redirect("/");

})

app.get('/images/delete/:id', async (req, res) => {

  const id = req.params.id
  image = await database.getImage(id)
  const fileName = image.file_name

  // Delete the image from s3
  const s3Result = await s3.deleteImages(fileName)

  // Delete the image from the database
  const result = await database.deleteImage(id)

  res.redirect("/");

})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});