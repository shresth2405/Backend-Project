import mongoose,{Schema} from "mongoose"

const LikeSchema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }
},
{
    timestamps: true
})

export const Likes = mongoose.model("Likes",LikeSchema);