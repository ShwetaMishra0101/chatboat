const router = require('express').Router()
const Chat = require('../models/Chat')
const jwt = require('jsonwebtoken')

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
    )
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Get chat history
router.get('/', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.userId })
    if (!chat) {
      return res.json({ chatHistory: [] })
    }
    res.json({ chatHistory: chat.chatHistory })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching chat history', error: error.message })
  }
})

// Add new message
router.post('/message', auth, async (req, res) => {
  try {
    const { message, type } = req.body

    let chat = await Chat.findOne({ userId: req.userId })

    if (!chat) {
      chat = new Chat({
        userId: req.userId,
        chatHistory: [],
      })
    }

    chat.chatHistory.push({
      type,
      message,
      time: new Date(),
    })

    await chat.save()
    res.json({
      message: 'Message added successfully',
      chatHistory: chat.chatHistory,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding message', error: error.message })
  }
})

// Clear chat history
router.delete('/', auth, async (req, res) => {
  try {
    await Chat.findOneAndUpdate(
      { userId: req.userId },
      { $set: { chatHistory: [] } },
    )
    res.json({ message: 'Chat history cleared successfully' })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error clearing chat history', error: error.message })
  }
})

module.exports = router
