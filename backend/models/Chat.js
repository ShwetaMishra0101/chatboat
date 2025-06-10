const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatHistory: [
      {
        type: {
          type: String,
          enum: ['user', 'system'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat
