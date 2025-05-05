import { sendWA, botIsReady, client } from '../bot/bot.client.js'

export async function getMessage(req, res) {
    const { target, message } = req.body

    if (!botIsReady) {
        return res.status(503).json({ error: "Bot belum login ke WhatsApp" })
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