const express = require('express')
const router = express.Router()

const ttsController = require('../controllers/ttsController')
router.get('/get/voices',ttsController.getVoiceIds)
router.post('/convert/text-to-voice',ttsController.tts)

module.exports = router