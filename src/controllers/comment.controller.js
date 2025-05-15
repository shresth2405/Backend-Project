import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comment = await Comment.aggregate([
        {
            $match:{
               video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField:"owner",
                foreignField:"_id",
                as:"Commentowner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },{
            $skip: (page-1)*parseInt(limit)
        }, 
        {
            $limit: limit
        }  
    ])
    if(!comment){
        throw new ApiError(400, "Comment cannot be fetched successfully")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params;
    // const video = Video.findById(videoId);

    const comment = await Comment.create(
        {
            content: content,
            video: videoId,
            owner: req.user?._id 
        }
    )
    if(!comment){
        throw new ApiError(400,"Comment cannot be empty");
    }
    // comment.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment created successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newComment} = req.body
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400, "Comment cannot be found")
    }
    comment.content= newComment;
    comment.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new ApiResponse(200, comment ,"comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}