// const express = require('express')
// const mongoose = require('mongoose')
// const cors = require('cors')
// const cookieParser = require('cookie-parser')
// require('dotenv').config()

// const app = express()

// // Middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   }),
// )
// app.use(express.json())
// app.use(cookieParser())

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatboat')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err))

// // Routes
// app.use('/api/auth', require('./routes/auth'))
// app.use('/api/chat', require('./routes/chat'))

// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
// })
