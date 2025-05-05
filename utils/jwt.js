import jwt from 'jsonwebtoken'

export function generateToken(id) {
    const SECRET_KEY = process.env.JWT_SECRET

    return jwt.sign(
        { id: id },
        SECRET_KEY,
        { expiresIn: '6h' }
    )
}

export function verifyToken(token) {
    const SECRET_KEY = process.env.JWT_SECRET
    return jwt.verify(token, SECRET_KEY)
}