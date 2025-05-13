import express from "express"
import CookieParser from "cookie-parser"
import cors from "cors"

const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit:'16kb'})) // to import the json file
app.use(express.urlencoded({extended:true, limit:"16kb"})) // to encode the url of the various browser
app.use(express.static("public")) //to store the components in the server
app.use(CookieParser()); //to store the cookie

//routes

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

//routes declaration
app.use('/api/v1/users',userRouter)
app.use('/api/v1/video',videoRouter)


export {app};