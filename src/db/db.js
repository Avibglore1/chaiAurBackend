import mongoose from 'mongoose'

const connectDB = async() =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        
    }catch(err){
        console.log('MONGODB connection Error ',err);
        throw err
    }
}

export default connectDB