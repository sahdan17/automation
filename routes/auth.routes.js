// routes/auth.routes.js
import express from 'express'
import { loginAuth } from '../controller/auth.controller.js'

const router = express.Router()
router.post('/bot/login', loginAuth)

export default router
