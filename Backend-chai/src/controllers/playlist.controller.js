import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, videos} = req.body
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos
    })
    console.log(playlist)
    if(!playlist) throw new ApiError(400, "Unable to create playlist");
    return res.status(200)
    .json(200, playlist, "Playlist created successfully")
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const getPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    return res.status(200)
    .json(new ApiResponse(200, getPlaylist, "Playlist fetched successfully"))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(404, "Playlist not found");
    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist found"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {videos : videoId}
        }
    )
    return res.status(200)
    .json(200, addVideo, "Video added successfully")
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const deleteVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos : videoId}
        }
    )
    return res.status(200)
    .json(200, deleteVideo, "Video deleted successfully")
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist) throw new ApiError(400, "Unable to delete the playlist");
    return res.status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const updatedPlatlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            name,
            description
        }
    )
    return res.status(200)
    .json(new ApiResponse(200, updatedPlatlist, "Playlist updated successfully"))
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}