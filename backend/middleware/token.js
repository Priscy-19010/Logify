import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {  // validates token
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {  // e.g Authorization: Bearer abc123
    try {
      token = req.headers.authorization.split(' ')[1]   // ['Bearer', 'abc123']

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password') //excludes the password

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' })
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' }) // catches bad token - expired, tamprered, etc
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' }) // Authorization: abc123
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' })
    } 
    next()
  }
}