const cloudinary = require("cloudinary").v2;
const multer = require("multer");

console.log("Cloudinary ENV CHECK:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "FOUND" : "MISSING");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING");
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = {
  upload,
  imageUploadUtil,
};