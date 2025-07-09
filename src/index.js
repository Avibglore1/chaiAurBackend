import mongoose from "mongoose";
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express();
(async()=>{
try{
await mongoose.connect(`${process.env.MONGODB_URI}`)
app.on('error',(err)=>{
    console.log('Error:',err);
})
app.listen(process.env.PORT,()=>{
    console.log(`App is listening on port ${process.env.PORT}`);
})
}catch(err){
    console.log('Error:', err);
    throw err
}
})()

