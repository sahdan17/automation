import { sendWA, botIsReady, client } from '../bot/bot.client.js'
import fs from 'fs'
import path from 'path'

const FAILED_MESSAGE_FILE = path.resolve('libs/json/failed_to_send.json')

export async function getMessage(req, res) {
    const { target, message } = req.body
    
    if (!botIsReady) {
        console.log('bot belum ready')
        const failedMessage = {
            target: target,
            message: message
        }

        let failedMessages = []
        try {
            if (fs.existsSync(FAILED_MESSAGE_FILE)) {
                const data = fs.readFileSync(FAILED_MESSAGE_FILE, 'utf-8')
                failedMessages = JSON.parse(data)
            }
        } catch (err) {
            console.error("❌ Gagal baca file JSON:", err.message)
        }

        failedMessages.push(failedMessage)

        try {
            fs.writeFileSync(FAILED_MESSAGE_FILE, JSON.stringify(failedMessages, null, 2), 'utf-8')
            console.log("✅ Pesan gagal dimasukkan ke antrian")
        } catch (err) {
            console.error("❌ Gagal simpan file JSON:", err.message)
        }

        return res.status(503).json({ error: "Bot belum login ke WhatsApp, pesan dimasukkan ke antrian" })
    }

    if (!target || !message) {
        return res.status(400).json({ error: "Target dan message wajib diisi!" })
    }

    try {
        await sendWA(target, message)
        return res.status(200).json({ success: true, message: "Terkirim!" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export async function getGroupList(req, res) {
    try {
        const chats = await client.getChats()
        const groups = chats
            .filter(chat => chat.isGroup)
            .map(chat => ({
            id: chat.id._serialized,
            name: chat.name
            }))

        return res.status(200).json({ groups })
    } catch (err) {
        console.error("❌ Gagal ambil list grup:", err.message)
        return res.status(500).json({ error: err.message })
    }
}