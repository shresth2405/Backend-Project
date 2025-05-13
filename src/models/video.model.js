import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema =new Schema({
    videoFile:{
        type:String,
        required:true,  
        index:true
    },
    title:{
        type:String,
        required:true,  
        index:true
    },
    description:{
        type:String,
        required:true,
        // unique:true,  
        index:true
    },
    duration:{
        type:Number,
        // required:true,
    },
    views:{
        type:Number,
        // required:true,
        default:0 
    },
    isPublished:{
        type:Boolean,
        default:true,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true, 
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},
{
    timestamps:true
}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=new mongoose.model("Video", videoSchema)