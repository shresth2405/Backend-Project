import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const commentSchema = new Schema({
    content: {
        type: string,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
    {
        timestamps: true
    })
commentSchema.plugin(mongooseAggregatePaginate);

export const Comments = mongoose.model("Comments", commentSchema);