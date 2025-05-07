import fs from 'fs'
import path from 'path'
import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from "qrcode-terminal"

const SESSION_PATH = path.resolve('./.wwebjs_auth/')
const PUPPETEER_CACHE = path.resolve('./node_modules/puppeteer/.local-chromium')
const FAILED_MESSAGE_FILE = path.resolve('libs/json/failed_to_send.json')

let botIsReady = false

const client = new Client({
    authStrategy: new LocalAuth(),
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        executablePath: process.env.NODE_ENV === "production"
            ? "/root/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome"
            : "C:/Users/sahda/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe",
        args: [
            '--no-default-browser-check',
            '--disable-session-crashed-bubble',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
        ],
        takeoverOnConflict: true,
    }
})

client.on('qr', (qr) => {
    console.log("📸 Silakan scan QR berikut:")
    qrcode.generate(qr, { small: true })
    botIsReady = false
})

client.on('ready', async () => {
    console.log("🤖 BOT SIAP & LOGIN")
    console.log("User:", client.info.pushname)
    console.log("Nomor:", client.info.wid.user)
    botIsReady = true

    // await sendWA("082289002445", "bot ready")
    sendFailedMessages()
    // fs.writeFileSync(FAILED_MESSAGE_FILE, JSON.stringify([], 2), 'utf-8')
})

client.on('auth_failure', () => {
    console.error("❌ Gagal otentikasi!")
    botIsReady = false
})

client.on('disconnected', async () => {
    console.warn("🔌 Terputus! Membersihkan sesi dan cache...")

    try {
        botIsReady = false
        await client.destroy()
        console.log("🛑 Client destroyed")

        if (fs.existsSync(SESSION_PATH)) {
            fs.rmSync(SESSION_PATH, { recursive: true, force: true })
            console.log("🧹 Sesi WA dibersihkan")
        }

        if (fs.existsSync(PUPPETEER_CACHE)) {
            fs.rmSync(PUPPETEER_CACHE, { recursive: true, force: true })
            console.log("🧼 Cache Puppeteer dibersihkan")
        }

        console.log("🔄 Reinitializing...")
        setTimeout(() => {
            client.initialize()
        }, 5000)

    } catch (err) {
        console.error("❌ Gagal bersihkan sesi/cache:", err.message)
    }
})

client.on('message', async (msg) => {
    const contact = await msg.getContact()
    const senderName = contact.name || contact.pushname || contact.number
    const chat = await msg.getChat()

    const messageText = msg.body
    const isGroup = chat.isGroup
    const chatName = isGroup ? chat.name : senderName

    const laporan = `Pesan Masuk! Dari ${senderName}` +
        (isGroup ? ` di Grup ${chatName}` : ``) + `\n` +
        messageText

    // kirim laporan
})

try {
    client.initialize()
} catch (err) {
    console.error("💥 Error saat init WA client:", err.message)
}

const sendWA = async (target, message) => {
    try {
        const targetReady = formatTarget(target)
        console.log(targetReady)
        await client.sendMessage(targetReady, message)
        console.log(`📩 Terkirim ke ${targetReady}: ${message}`)
    } catch (err) {
        console.error(`❌ Gagal kirim ke ${target}:`, err.message)
        throw err
    }
}

const formatTarget = (target) => {
    if (target.startsWith("0")) {
        return target.replace("0", "62") + "@c.us"
    } else if (target.startsWith("+")) {
        return target.replace("+", "") + "@c.us"
    } else if (!target.endsWith("@c.us") && !target.endsWith("@g.us")) {
        return target + "@c.us"
    } else {
        return target
    }
}

const sendFailedMessages = async () => {
    try {
        if (!fs.existsSync(FAILED_MESSAGE_FILE)) {
            console.log("📂 Tidak ada file pesan gagal, lewati...")
            return
        }

        const data = fs.readFileSync(FAILED_MESSAGE_FILE, 'utf-8')
        const failedMessages = JSON.parse(data)

        if (failedMessages.length === 0) {
            console.log("✅ Tidak ada pesan gagal untuk dikirim")
            return
        }

        console.log(`🔄 Mengirim ${failedMessages.length} pesan yang tertunda...`)
        const interval = 3000 * failedMessages.length

        for (const { target, message } of failedMessages) {
            try {
                const formattedTarget = formatTarget(target)
                console.log(`📩 Mengirim ke ${formattedTarget}: ${message}`)

                await sendWA(formattedTarget, message)
                console.log(`✅ Terkirim ke ${formattedTarget}`)
            } catch (err) {
                console.error(`❌ Gagal kirim ke ${target}:`, err.message)
            }
        }

        setInterval(() => {
            fs.writeFileSync(FAILED_MESSAGE_FILE, JSON.stringify([], 2), 'utf-8')
        }, interval)
        console.log("🧹 Pesan gagal berhasil dikirim dan sisa pesan gagal diperbarui")

    } catch (err) {
        console.error("❌ Gagal membaca atau mengirim pesan gagal:", err.message)
    }
}

export { sendWA, botIsReady, client }
