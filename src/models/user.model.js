import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema=new Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    fullName:{
        type: String,
        required:true,
        lowercase:true,
        index:true,
    }, 
    avatar:{
        type: String ,//cloud url
        required:true
    },
    coverImg :{
        type: String ,//cloud url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, "Password is true"], 
    },
    refreshToken:{
        type:String,
        select:false,
    },
},
{
    timestamps:true,
})

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
}) //to encrypt the password

userSchema.methods.isPasswordCorrect=async function (password){
    // const passwordForCheck=await bcrypt.hash(password, 10);
    // console.log(passwordForCheck);
    // console.log(this.password);
    const result=await bcrypt.compare(password, this.password)
    // console.log(result)
    return result
}
// "$2b$10$5GGr5fdJtaneINEdNKV2ke8eMGYjETsmPbTpxoRCgaUpuVuGwyWJ6"
userSchema.methods.generateAccessToken=async function (){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username: this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken=async function (){
    return  jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User=mongoose.model("User", userSchema)