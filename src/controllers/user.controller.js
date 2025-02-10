import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


// taking data from the frontend


export const registerUser=asyncHandler(async(req,res)=>{
    const {fullName,email,username,password} = req.body
    console.log(("email:",email));

    // if(email===""){
    //     throw new ApiError(400,"email is required")
    // }
if([fullName,email,username,password].some((fields)=>fields.trim()==="")){
    throw new ApiError(400,"All Fields are required")
}

const ExistedUser=User.findOne({
    $or: [{username},{email}]
})

if(ExistedUser){
    throw new ApiError(409,"User with email or username already exist")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath=req.files?.coverImg[0]?.path;

if(!avatarLocalPath)
    throw new ApiError(400,"Avatar is required")
})
const avatar=await UploadOnCloudinary(avatarLocalPath);
const coverImg=await UploadOnCloudinary(coverImageLocalPath);

if(!avatar){
    throw new ApiError(400,"Avatar is required")
}

const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImg: coverImg?.url||"",
    email,
    password,
    username:username.toLowerCase()
})

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
}

return res.status(201).json({
    new ApiResponse(200,createdUser, "User registered successfully")
})