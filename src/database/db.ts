import mongoose from 'mongoose'
import config from '../dotenvConfig.ts'

const connectDB=async():Promise<void>=>{

    try{
        await mongoose.connect(config.MONGODB_URI as string)
        console.log('Connected to MongoDB')
    }catch(error:unknown){
        console.error('MongoDB connection error:', (error as Error).message)
        // Don't exit - let server run without database
        throw error
    }
}
export default connectDB