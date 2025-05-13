import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;
    const { channelId } = req.params;

    if (subscriberId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself.");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    let message = "";

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.deleteOne({ _id: existingSubscription._id });
        message = "Unsubscribed successfully.";
    } else {
        // Subscribe
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        });
        message = "Subscribed successfully.";
    }

    return res.status(200).json(new ApiResponse(200, null, message));
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriber = await Subscription.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup:{
               from: "users",
               localField: "subscriber",
               foreignField: "_id",
               as: "subscriberDetails" 
            }
        },
        {
            $unwind:"$subscriberDetails"
        },
        {
            $project: {
                subscriberId: "$subscriberDetails._id",
                fullName: "$subscriberDetails.fullname",
                avatar:"$subscriberDetails.fullname"
            }
        }
    ])
    return res.json(
        new ApiResponse(201, subscriber, "Subscriber fetched SuccessFully")
    )


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const channels = await Subscription.aggregate([
        {
            $match: {_id: mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from: "users",
                localField:"channel",
                foreignField: "_id",
                as: "channelDetail"
            }
        },{
            $unwind: "$channelDetail"
        },
        {
            $project:{
                channelId: "$channelDetail._id",
                username: "$channelDetail.username",
                avatar: "$channelDetail.avatar"
            }
        }
    ])
    return new ApiResponse(201, channels, "ChannelSubscribed fetched SuccessFully")
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}