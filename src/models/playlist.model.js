import mongoose from "mongoose"


const playlistSchema= new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        required: true
    },
    description:{
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
},
{
    timestamps: true
})


export const Playlist= mongoose.model("Playlist", playlistSchema)