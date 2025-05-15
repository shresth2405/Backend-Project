import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { deleteOnCloudinary, UploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllVideo = asyncHandler(async(req, res)=>{
    const { page=1, limit=10, query, sortBy,sortType="desc",userId} = req.query;
    const match = {
        ...(query?{title:{$regex: query, $options: "i"}}: {}),
        ...(userId?{title:{$regex: userId, $options: "i"}}: {})
    }

    const video = await Video.aggregate([
        {
            $match: match,
        },{
            $lookup:{
                from : "users",
                localField: "owner",
                foreignField:"_id",
                as: "videoByOwner"
            }
        },{
            $project:{
                videoFile: 1,
                thumbNail:1,
                title:1,
                description:1,
                views: 1,
                owner: {
                    $arrayElemAt: ["$videoByOwner",0],
                }
            }
        },{
            $sort:{
                [sortBy]: sortType==="desc"?-1:1
            }
        },{
            $skip: (page-1)*parseInt(limit)
        },{
            $limit: parseInt(limit)
        }
    ])
    console.log(video)

    if(!video.length){
        throw new ApiError(400,"videos cannot be fetched");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Fetched successfully")
    )
})

export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoFilepath = req.files?.videoFile[0]?.path;
    const thumbNailpath = req.files?.thumbNail[0]?.path;

    // console.log(req.files)


    const videoToUpload = await UploadOnCloudinary(videoFilepath);
    const thumbnailToUpload = await UploadOnCloudinary(thumbNailpath);

    if (!videoToUpload && !thumbnailToUpload) {
        throw new ApiError(400, "Files are not uploaded...")
    }
    const user= await User.findById(req.user?._id);
    const video = await Video.create({
        videoFile: videoToUpload.url,
        title: title,
        description: description,
        thumbnail: thumbnailToUpload.url,
        isPublished: true,
        owner: user,
        views:0
    })
    
    const videoPublished = await Video.findOne({title});
    if(!videoPublished){
        throw new ApiError(400, "Video cannot be published");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, videoPublished, "Video Published succesfully")
    )
})

export const getVideoById = asyncHandler(async (req, res) => { //isko check kaise keru??
    const { videoId } = req.params;
    
    const video = await Video.findById(videoId);

    console.log(video)

    if (!video.length) {
        throw new ApiError(400, "Video cannot be fetched successfully");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => { // to update the thumbnail
    const { videoId } = req.params
    const { title, description} = req.body
    const video = await Video.findById(videoId);
    console.log(video.owner._id)
    console.log(req.user._id)
    if(video.owner._id.toString()!==req.user._id.toString()){
        throw new ApiError(401, "Unauthorised Request");
    }
    video.title=title;
    video.description= description;
    await video.save({validateBeforeSave: false})
    return res
    .status(201)
    .json(new ApiResponse(201, video, "video updated successfully"))

})

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if(video.owner._id.toString()!==req.user._id.toString()){
        throw new ApiError(401, "Unauthorised Request");
    }
    const path= video.videoFile;
    await deleteOnCloudinary(path);
    await Video.findByIdAndDelete(videoId)

    return res
    .status(201)
    .json(new ApiResponse(201, "video deleted successfully"))

})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    console.log(req.params)
    let message;
    const { videoId } = req.params
    console.log(videoId)
    const video = await Video.findById(videoId);
    if(video.owner._id.toString()!==req.user._id.toString()){
        throw new ApiError(401, "Unauthorised Request");
    }
    if(video.isPublished){
        video.isPublished=false;
        message = "Video unpublished successfully"
    }
    else{
        video.isPublished= true
        message = "Video published successfully"
    }
    video.save({validateBeforeSave: false})

    return res.status(201)
    .json(new ApiResponse(201, message))

})

export const increaseViews=asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    (video.views)++;
    video.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Views added successfully")
    )
})

