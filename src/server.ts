

import config from './dotenvConfig.js'
import app from './app.js'
import connectDB from './database/db.ts'


const connectServer=async()=>{
try{
    await connectDB()
    app.listen(config.PORT,()=>{
        console.log(`Server is running on port ${config.PORT}`)
    })
}catch(error:unknown){
    console.log((error as Error).message)
    process.exit(1)
}
    
}
connectServer()


