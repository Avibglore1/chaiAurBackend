import { v2 as cloudinary } from "cloudinary";

import fs from 'fs'
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        const resp = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        console.log('file is uploaded on cloudianry', resp.url);
        return resp
    }catch(err){
        console.error("Cloudinary upload failed:", err);
        try {
            fs.unlinkSync(localFilePath);
        } catch (fsErr) {
            console.error("Error deleting local file:", fsErr);
        }
        return null;
    }
}

export default uploadOnCloudinary