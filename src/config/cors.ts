import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? JSON.parse(process.env.ALLOWED_ORIGINS) 
  : ["http://localhost:5173"];

export const corsOptions: cors.CorsOptions = {
  origin: function(origin, callback) {
    if(!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
};
