import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import { Subscription } from "../models/subscription.models.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    })
    const totalVideos = await Video.countDocuments({
        owner: channelId
    })
    const likes = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)  
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $project: {
                likeCount: { $size: "$videoLikes" }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: "$likeCount" }
            }
        }
    ])
    const totalLikes = likes[0]?.totalLikes || 0
    return res.status(200)
    .json(new ApiResponse(200, {subscriberCount, totalLikes, totalVideos}, "Channel stats fetched successfully"))
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1
            }
        }
    ])
    console.log(videos)
    return res.status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }