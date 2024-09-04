import express from "express"
import cors from "cors"
import 'dotenv/config'
import apiRoutes from "./routes/apiRoutes"
import mongoose from "mongoose";


const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, API_SERVER_PORT, FRONTEND_CORS_URL, API_MONGO_CONNECTION} = process.env;

if(!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET || !API_SERVER_PORT || !FRONTEND_CORS_URL ||! API_MONGO_CONNECTION) throw new Error('Required env vars not set');

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: FRONTEND_CORS_URL
}));

// Routes for API
app.use("/api", apiRoutes);

// Connect db and start server...
mongoose.connect(API_MONGO_CONNECTION)
.then(() => {
    console.log('Connected to database!')
    app.listen(API_SERVER_PORT, ()=> {
        console.log(`API Server listening on port ${API_SERVER_PORT}`)
    });
})
.catch((error)=> () => console.log('ERROR connecting to database!', error));
export default app;