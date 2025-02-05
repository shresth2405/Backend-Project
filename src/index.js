// require("dotenv").config({path:'./env '});
import dotenv from "dotenv";
import mongoose from "mongoose"
import {DB_NAME} from "./constants.js"
import express from "express"
import connectDB from "./db/index.js";



const app=express();
dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Port is listening on port ${process.env.PORT}`)
})
})
.catch((err)=>{
    console.log("MongoDb connection failed!!!",err)
})
// CORS -> cross origin resource sharing






// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Error:",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`Port is listening on port ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.log("Error:", error);
//     }
// })()