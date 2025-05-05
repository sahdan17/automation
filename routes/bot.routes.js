import express from 'express'
import { getMessage, getGroupList } from '../controller/bot.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/bot/getMessage', authMiddleware, getMessage)
router.post('/bot/getGroupList', getGroupList)

export default router