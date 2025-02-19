import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from "fs"
import jwt from "jsonwebtoken"
// import bcrypt from "bcrypt"


const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user= await User.findById(userId);
        let AccessToken=await user.generateAccessToken()
        let RefreshToken=await user.generateRefreshToken()
        // console.log("In Function:",AccessToken)
        // console.log("In  function :",RefreshToken)
        user.refreshToken=RefreshToken
        await user.save({validateBeforeSave: false});
        return {AccessToken, RefreshToken}

    }catch(err){
        throw new ApiError(500,"something went wrong")
    }
}

// taking data from the frontend


export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body
    // console.log(("email:", email));

    // if(email===""){
    //     throw new ApiError(400,"email is required")
    // }
    if ([fullName, email, username, password].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }

    const ExistedUser = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (ExistedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImg?.[0]?.path;
    // console.log(avatarLocalPath);
    if (!avatarLocalPath || !fs.existsSync(avatarLocalPath)) {
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverImg = await UploadOnCloudinary(coverImageLocalPath);
    if(!coverImg){
        console.log("Failed to fetch cover image")
    }

    // console.log(avatar);
    if (!avatar ) {
        throw new ApiError(400, "avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        email,
        password,
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

export const loginUser=asyncHandler(async(req,res)=>{
    // console.log(req.body)
    // console.log(req.headers)
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400,"request body is empty");
    }
    const {email,username,password}=req.body
    // console.log(email)
    // console.log(username)
    // console.log(password);
    if(!(email || username)){
        throw new ApiError(400, "Username or email is required")
    }
    const user=await User.findOne({
        // $or:[{ username}, {email}] //to check for email and username at once
        email
    }).select("+password")
    // console.log(user)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const checkpassword=await user.isPasswordCorrect(password)
    if(!checkpassword){
        throw new ApiError(401,"Password is incorrect")
    }

    const {AccessToken, RefreshToken}=await generateAccessAndRefreshToken(user._id)
    // console.log(AccessToken)
    // console.log(RefreshToken)
    // user.refreshToken=RefreshToken
    // await user.save({validateBeforeSave:false});
    const LoggedinUser=await User.findById(user._id).select("-password -refreshToken")

    const option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",AccessToken,option)
    .cookie("refreshtoken",RefreshToken,option)
    .json(
        new ApiResponse(200,{
            user:LoggedinUser,AccessToken,RefreshToken},"User LoggedIn Successfully")
    )
})

export const logoutUser=asyncHandler(async(req,res)=>{
    const userid=await req.user._id
    // console.log(userid)
    await User.findByIdAndUpdate((userid), {
        $set:{
            refreshToken: undefined
        },
    },
    {
        new: true,
    }
    )
    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshtoken", option)
    .json(new ApiResponse(200,{},"User logged out succesfully"))

})

export const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        // console.log(req.cookies)
        const incomingRefreshToken=req.cookies.refreshtoken|| req.body.refreshToken
        // console.log(incomingRefreshToken)
        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("+refreshToken")
        // console.log(user);
        if(!user){
            throw new ApiError(401,"User not found")
        }
        // console.log(user?.refreshToken)
        // console.log(incomingRefreshToken)
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired")
        }
        const option={
            httpOnly:true,
            secure:true
        }
        const token=await generateAccessAndRefreshToken(user._id)
        // const {accessToken, newrefreshToken}=await generateAccessAndRefreshToken(user._id)
        console.log(token)
        const {AccessToken, RefreshToken}=token
        // console.log(AccessToken)
        // console.log(RefreshToken)
        user.refreshToken=RefreshToken;
        await user.save()
        return res.status(200)
        .cookie("accessToken",AccessToken,option)
        .cookie("refreshtoken",RefreshToken, option)
        .json(new ApiResponse(200,{AccessToken, RefreshToken},"AccessToken Refreshed"))
    } catch (error) {
        throw new ApiError(401,error.message)
    }
})