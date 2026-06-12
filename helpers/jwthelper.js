import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '24h'

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || ''
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
}


//middleware for protected reoutes, if not authenticated, sends response 401 itself
//jwt decrypted passed in req.user
function verifyToken(req, res, next) {
  const token = getBearerToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}


//use for conditional response based on authenticated
//non authenticated users get blank req.user object
//jwt decrypted passed in req.user
function optionalVerifyToken(req, res, next) {
  const token = getBearerToken(req)

  if (!token) {
    req.user = null
    return next()
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    req.user = null
  }

  return next()
}

export { signToken, verifyToken, optionalVerifyToken }
