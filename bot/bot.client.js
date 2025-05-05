import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from "qrcode-terminal"
import moment from "moment-timezone"

const postfix = "@c.us"
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
})

client.on('auth_failure', () => {
    console.error("❌ Gagal otentikasi!")
    botIsReady = false
})

client.on('disconnected', () => {
    console.warn("🔌 Terputus! Reinitializing...")
    botIsReady = false
    setTimeout(() => {
        client.initialize()
    }, 5000)
})

client.on('message', async (msg) => {
    // console.log("📩 Pesan masuk:", msg.body, "oleh: ", msg.from)
    // if (msg.body === 'ping') {
    //     await sendWA(msg.from, 'pong 🏓')
    // } else if (msg.body.startsWith("!say ")) {
    //     const content = msg.body.slice(5)
    //     await sendWA(msg.from, `🗣️ Kamu bilang: ${content}`)
    // } else if (msg.body === "!time") {
    //     const now = moment().tz("Asia/Jakarta").format("dddd, DD MMM YYYY HH:mm:ss")
    //     await sendWA(msg.from, `⏰ Sekarang jam: ${now}`)
    // }
})

try {
    client.initialize()
} catch (err) {
    console.error("💥 Error saat init WA client:", err.message)
}

const sendWA = async (target, message) => {
    try {
        const targetReady = target.endsWith("@c.us") || target.endsWith("@g.us")
        ? target
        : `${target}${postfix}`
        await client.sendMessage(targetReady, message)
        console.log(`📩 Terkirim ke ${targetReady}: ${message}`)
    } catch (err) {
        console.error(`❌ Gagal kirim ke ${target}:`, err.message)
        throw err
    }
}

export { sendWA, botIsReady, client }
