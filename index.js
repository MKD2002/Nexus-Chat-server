import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ContactRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoute.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const database_URl = process.env.DATABASE_URL;

app.use(cors({
    origin:[process.env.ORIGIN],
    methods:['GET','POST','PUT','DELETE','PATCH'],
    credentials:true
}));
app.use("/uploads/profiles",express.static("uploads/profiles"))
app.use("/uploads/files",express.static("uploads/files"))
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/contacts",contactsRoutes);
app.use('/api/messages',messagesRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

setupSocket(server);

mongoose.connect(database_URl).then(()=>console.log('Database connected')).catch(err=>console.log(err.message));
