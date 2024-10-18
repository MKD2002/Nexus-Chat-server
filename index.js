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

const corsOptions = {
    origin:process.env.ORIGIN,
    methods:['GET','POST','PUT','DELETE','PATCH'],
    credentials:true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: '*',
};

app.use(cors(corsOptions))
app.options('*', cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN);  // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use("/uploads/profiles",express.static("uploads/profiles",{
    setHeaders: function (res, path) {
    res.set('Access-Control-Allow-Origin', '*'); // Allow cross-origin access to images
    res.set('Content-Type', 'application/json');
  }
}))
app.use("/uploads/files",express.static("uploads/files",{
    setHeaders: function (res, path) {
    res.set('Access-Control-Allow-Origin', '*'); // Allow cross-origin access to images
    res.set('Content-Type', 'application/json');
  }
}))
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
