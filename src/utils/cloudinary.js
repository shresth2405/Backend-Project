import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const UploadOnCloudinary=async function(loacalPathFile){
    try{
        if(!loacalPathFile) return null
        const response=await cloudinary.uploader
        .upload(
            loacalPathFile,{
             resource_type:"auto"
            }
        )
        fs.unlinkSync(loacalPathFile)
        // console.log("file is uploaded successfully",response.url)
        return response;
    }catch(error){
        fs.unlinkSync(loacalPathFile)
        return null
    }
}

const deleteOnCloudinary= async(localpath)=>{
    try{
        cloudinary.uploader
  .destroy(localpath)
    }catch(e){
        console.log("cannot delete");
    }
}

export {UploadOnCloudinary,deleteOnCloudinary}

