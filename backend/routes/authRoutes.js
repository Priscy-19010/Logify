import express from 'express'
import { signup, login, getMe, deleteAccount } from '../controllers/authController.js'
import { protect } from '../middleware/token.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', protect, getMe)
router.delete('/me', protect, deleteAccount)

export default router