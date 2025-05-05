import { generateToken } from '../utils/jwt.js'

export async function loginAuth(req, res) {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ error: "ID wajib diisi" })
    }

    try {
        const token = generateToken({ id })
        return res.status(200).json({ token })
    } catch (err) {
        return res.status(500).json({ error: `Gagal membuat token: ${err.message}` })
    }
}
