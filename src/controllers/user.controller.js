import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { deleteOnCloudinary, UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from "fs"
import jwt from "jsonwebtoken"
import { channel } from "diagnostics_channel";
import { timeStamp } from "console";
import { pipeline } from "stream";
import mongoose from "mongoose";
// import bcrypt from "bcrypt"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        let AccessToken = await user.generateAccessToken()
        let RefreshToken = await user.generateRefreshToken()
        // console.log("In Function:",AccessToken)
        // console.log("In  function :",RefreshToken)
        user.refreshToken = RefreshToken
        await user.save({ validateBeforeSave: false });
        return { AccessToken, RefreshToken }

    } catch (err) {
        throw new ApiError(500, "something went wrong")
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
    if (!coverImg) {
        console.log("Failed to fetch cover image")
    }

    // console.log(avatar);
    if (!avatar) {
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

export const loginUser = asyncHandler(async (req, res) => {
    // console.log(req.body)
    // console.log(req.headers)
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "request body is empty");
    }
    const { email, username, password } = req.body
    // console.log(email)
    // console.log(username)
    // console.log(password);
    if (!(email || username)) {
        throw new ApiError(400, "Username or email is required")
    }
    const user = await User.findOne({
        // $or:[{ username}, {email}] //to check for email and username at once
        email
    }).select("+password")
    // console.log(user)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const checkpassword = await user.isPasswordCorrect(password)
    if (!checkpassword) {
        throw new ApiError(401, "Password is incorrect")
    }

    const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id)
    // console.log(AccessToken)
    // console.log(RefreshToken)
    // user.refreshToken=RefreshToken
    // await user.save({validateBeforeSave:false});
    const LoggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", AccessToken, option)
        .cookie("refreshtoken", RefreshToken, option)
        .json(
            new ApiResponse(200, {
                user: LoggedinUser, AccessToken, RefreshToken
            }, "User LoggedIn Successfully")
        )
})

export const logoutUser = asyncHandler(async (req, res) => {
    const userid = await req.user._id
    // console.log(userid)
    await User.findByIdAndUpdate((userid), {
        $set: {
            refreshToken: undefined
        },
    },
        {
            new: true,
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshtoken", option)
        .json(new ApiResponse(200, {}, "User logged out succesfully"))

})

export const changePassword= asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword && !newPassword){
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findById(req.user?.id);
    console.log(user);
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError (400, "Password must be wrong");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Password is successfully changed")
    )   
})

export const changeAvatar= asyncHandler(async(req, res)=>{
    console.log(req.file)
    const newAvatarpath = req.file?.path;
    console.log(newAvatarpath);
    if(!newAvatarpath){
        throw new ApiError(400, "Avatar does not exist");
    }
    const user = await User.findById(req.user?.id).select("-password -refreshToken");
    await deleteOnCloudinary(user.avatar);
    const newAvatar= await UploadOnCloudinary(newAvatarpath)
    user.avatar = newAvatar;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new ApiResponse(200, {} ,"Avatar uccessfully changed")
    )
})

export const getUserchannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required")
    }
    const channel = await User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    }, {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields: {
            subscriberCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project: {
            fullName: 1,
            username: 1,
            subscriberCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImg: 1,
            email: 1
        }
    }
    ])
    console.log(channel)
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0],"User channel fetched successfully")
    )

})

export const getWatchHistory=asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory" ,
                pipeline: [
                    {
                        $lookup:{
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }]
        
    )
    console.log(user);
    if(!user){
        throw new ApiError (400, "User not found");
    }
    return res
    .status(200)
    .json ( new ApiResponse(200, user[0].watchHistory,"WatchHistory fetched Successfully"))
   
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        // console.log(req.cookies)
        const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshToken
        // console.log(incomingRefreshToken)
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("+refreshToken")
        // console.log(user);
        if (!user) {
            throw new ApiError(401, "User not found")
        }
        // console.log(user?.refreshToken)
        // console.log(incomingRefreshToken)
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }
        const option = {
            httpOnly: true,
            secure: true
        }
        const token = await generateAccessAndRefreshToken(user._id)
        // const {accessToken, newrefreshToken}=await generateAccessAndRefreshToken(user._id)
        console.log(token)
        const { AccessToken, RefreshToken } = token
        // console.log(AccessToken)
        // console.log(RefreshToken)
        user.refreshToken = RefreshToken;
        await user.save()
        return res.status(200)
            .cookie("accessToken", AccessToken, option)
            .cookie("refreshtoken", RefreshToken, option)
            .json(new ApiResponse(200, { AccessToken, RefreshToken }, "AccessToken Refreshed"))
    } catch (error) {
        throw new ApiError(401, error.message)
    }
})