import { verifyToken } from '../utils/jwt.js'

export function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token tidak ditemukan atau format salah" })
    }

    const token = authHeader.split(' ')[1]

    try {
        verifyToken(token)
        next()
    } catch (err) {
        return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa" })
    }
}