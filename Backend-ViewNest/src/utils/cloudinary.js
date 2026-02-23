import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getPublicId = (url) => {
  const parts = url.split('/');
  const fileName = parts.pop();                 // myvideo.mp4
  const folder = parts.slice(parts.indexOf('upload') + 1).join('/');
  const publicId = folder.replace(/v\d+\//, '') + fileName;
  return publicId.replace(/\.[^/.]+$/, "");     // remove extension
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log('Error while uploading to Cloudinary')
        return null
    }
}

const deleteFromCloudinary = async (url, type = "image") => {
  const publicId = getPublicId(url);

  return await cloudinary.uploader.destroy(publicId, {
    resource_type: type === "video" ? "video" : "image"
  });
};
export { 
    uploadOnCloudinary,
    deleteFromCloudinary,
}