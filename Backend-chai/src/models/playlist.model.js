import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: "Video"
            },
            videoFile: {
                type: String,
                required: true
            },
            thumbnail: {
                type: String,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            title: {
                type: String,
                required: true
            }
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true})



export const Playlist = mongoose.model("Playlist", playlistSchema)