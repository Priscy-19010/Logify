import express from 'express'
import {
    saveStudentProfile,
    getStudentProfile,
    sendJoinRequest,
    getJoinRequestForStudent,
    getLogbook,
    updateDayEntry,
    submitDay,
    submitMonth,
    sendCompanyRequest,
    getCompanyRequestForStudent 
} from '../controllers/studentController.js'
import { protect, requireRole } from '../middleware/token.js'

const router = express.Router()

router.use(protect, requireRole('student'))

router.post('/profile', saveStudentProfile)
router.get('/profile', getStudentProfile)
router.post('/join-request', sendJoinRequest)
router.get('/join-request', getJoinRequestForStudent)
router.get('/logbook', getLogbook)
router.patch('/logbook/:monthId/:weekId/:dayId', updateDayEntry)
router.post('/logbook/:monthId/:weekId/:dayId/submit', submitDay)
router.post('/logbook/:monthId/submit', submitMonth)
router.post('/company-request', sendCompanyRequest)
router.get('/company-request', getCompanyRequestForStudent)

export default router