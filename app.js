import { config } from 'dotenv'
config()
import express, { json, urlencoded } from 'express'
import bot_route from './routes/bot.routes.js'
import auth_route from './routes/auth.routes.js'

const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))
app.use('/api/v1/', bot_route)
app.use('/api/v1/', auth_route)

export default app
