// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/chatbot")
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

// const Message = mongoose.model("Message", new mongoose.Schema({
//   role: String,
//   content: String
// }));

// app.get("/messages", async (_, res) => {
//   const messages = await Message.find();
//   res.json(messages);
// });

// app.post("/messages", async (req, res) => {
//   const newMessage = new Message(req.body);
//   await newMessage.save();
//   res.json(newMessage);
// });

// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });


// import OpenAI from "openai";
// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// const completion = await client.chat.completions.create({
//     model: "gpt-4.1",
//     messages: [
//         {
//             role: "user",
//             content: "Write a one-sentence bedtime story about a unicorn.",
//         },
//     ],
// });

// console.log(completion.choices[0].message.content);


// import fs from "fs/promises";
// import OpenAI from "openai";
// const client = new OpenAI();

// const instructions = await fs.readFile("prompt.txt", "utf-8");

// const response = await client.responses.create({
//     model: "gpt-4.1",
//     instructions,
//     input: "How would I declare a variable for a last name?",
// });

// console.log(response.output_text);



// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatboat')
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/chat', require('./routes/chat'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 






import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/Routes/auth.routes'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes)

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!)
.then(()=>{
    console.log("mongodb connect port: localhost:4040");
    app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));

})
.catch((error)=>{
    console.error("MongoDB connection failed:", error);
})