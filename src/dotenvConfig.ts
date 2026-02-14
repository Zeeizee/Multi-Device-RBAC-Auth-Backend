import dotenv from 'dotenv'
dotenv.config({path:'./.env'})


const PORT=process.env.PORT||3000
const MONGODB_URI=process.env.MONGODB_URI||'mongodb://localhost:27017/authapp'
const JWT_ACCESS_SECRET=process.env.JWT_ACCESS_SECRET||'secret'
const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET||'1h'
const JWT_ACCESS_EXPIRES_IN=process.env.JWT_ACCESS_EXPIRES_IN||'1h'
const JWT_REFRESH_EXPIRES_IN=process.env.JWT_REFRESH_EXPIRES_IN||'1h'

 const config={PORT,MONGODB_URI,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN}
export default config