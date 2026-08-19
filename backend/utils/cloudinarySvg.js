const cloudinary = require("../config/cloudinary");

async function uploadCloudinary(svg) {
  try {
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "upload",
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message || error);
    throw error;
  }
}

module.exports = uploadCloudinary;
