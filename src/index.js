import dotenv from 'dotenv'
dotenv.config()
import connectDB from "./db/db.js";
import { app } from './app.js';

const port = process.env.PORT || 8000


await connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server running at port: ${port}`);
    })
})
.catch((err)=>{
    console.log('MongoDb Connection failed!!', err);
    process.exit(1)
})

// const app = express();
// (async()=>{
// try{
// await mongoose.connect(`${process.env.MONGODB_URI}`)
// app.on('error',(err)=>{
//     console.log('Error:',err);
// })
// app.listen(process.env.PORT,()=>{
//     console.log(`App is listening on port ${process.env.PORT}`);
// })
// }catch(err){
//     console.log('Error:', err);
//     throw err
// }
// })()

