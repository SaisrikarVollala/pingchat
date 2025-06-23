import {v2 as cloudinary} from 'cloudinary';
import { config } from 'dotenv'; 
import {env} from './env'
config()
cloudinary.config(
    {
        cloud_name:env.CLOUDINARY_CLOUDNAME,
        api_key:env.CLOUDINARY_APIKEY,
        api_secret:env.CLOUDINARY_APISECREAT
    }
)
export default cloudinary;