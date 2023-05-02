const express = require('express')
const router = express.Router();

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', async (req, res) => {
    try {
        // Get all Message objects using `.find()`
        const messages = await Message.find()
        // Return the Message objects as a JSON list
        return res.status(200).json({ messages })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/** Route to get one message by id. */
router.get('/:messageId', async (req, res) => {
    // Get the Message object with id matching `req.params.id`
    // using `findOne`
    try {
        const message = await Message.findOne({ _id: req.params.messageId })
        // Return the matching Message object as JSON
        return res.status(200).json({ message })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/** Route to add a new message. */
router.post('/', async (req, res) => {
    try {
        const message = new Message(req.body)
        await message.save()
        const user = await User.findById(message.author)
        user.messages.unshift(message)
        await user.save()
        // Return a 200 status and the Message object in JSON
        return res.status(200).json({ message })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/** Route to update an existing message. */
router.put('/:messageId', async (req, res) => {
    // Update the matching message using `findByIdAndUpdate`
    try {
        const message = await Message.findByIdAndUpdate(req.params.messageId, req.body)
        const updatedMessage = await Message.findOne({ _id: req.params.messageId })
        // Return the updated Message object as JSON
        return res.status(200).json({ message: updatedMessage })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/** Route to delete a message. */
router.delete('/:messageId', (req, res) => {
    // Delete the specified Message using `findByIdAndDelete`. Make sure
    try {
        Message.findByIdAndDelete(req.params.messageId)
            .then(result => {
                if (result === null) {
                    return res.status(404).json({ message: 'Message does not exist.' })
                }
                // Return a JSON object indicating that the Message has been deleted
                return res.status(200).json({
                    'message': 'Successfully deleted.',
                    '_id': req.params.messageId
                })
            })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

module.exports = router
