import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content.trim()) throw new ApiError(400, "Content is required");
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    if(!tweet) throw new ApiError(400, "Unable to create tweet");
    return res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet posted successfully"))


    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const channel = await User.findById(channelId)
    if(!channel) throw new ApiError(400, "Channel does not exist");
    const allTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project: {
                _id: 1,
                content: 1
            }
        }
    ])
    return res.status(200)
    .json(new ApiResponse(200, allTweets, "All tweets fetched successfully"))
    // TODO: get user tweets
})

const getTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    console.log(tweet)
    if(!tweet) throw new ApiError(400, "Tweet not found");
    return res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400, "Tweet not found");
    const {content} = req.body
    const updatedTweet = Tweet.findOneAndUpdate(tweetId,{content})
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400, "Tweet not found");
    const {content} = req.body
    const deletedTweet = Tweet.findOneAndDelete(tweetId)
    return res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweet,
}