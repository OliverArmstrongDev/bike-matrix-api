import express from "express"
import cors from "cors"
import 'dotenv/config'
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes"

const {FRONTEND_CORS_URL, AUTH_MONGO_CONNECTION, AUTH_SERVER_PORT} = process.env;

if(!FRONTEND_CORS_URL || !AUTH_MONGO_CONNECTION || !AUTH_SERVER_PORT) throw new Error('Required env vars not set');

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: FRONTEND_CORS_URL
}));

app.use("/api", authRoutes);

// Connect db and start server...
mongoose.connect(AUTH_MONGO_CONNECTION)
.then(() => {
    console.log('Connected to database!')
    app.listen(AUTH_SERVER_PORT, ()=> {
    console.log("AuthServer Listening on port " + AUTH_SERVER_PORT)
    })
})
.catch((error)=> () => console.log('ERROR connecting to database!', error));