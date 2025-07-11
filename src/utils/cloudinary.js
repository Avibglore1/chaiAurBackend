import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        const resp = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        console.log('file is uploaded on cloudianry', resp.url);
         fs.unlinkSync(localFilePath);
        return resp
    }catch(err){
        console.error("Cloudinary upload failed:", err);
        return null;
    }
}

export default uploadOnCloudinary