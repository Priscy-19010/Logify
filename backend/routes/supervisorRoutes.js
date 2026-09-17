import express from 'express'
import {
    getStudentsForSupervisor,
    getPendingRequestsForSupervisor,
    respondJoinRequest,
    suggestSupervisors,
    setWeekMark 
} from '../controllers/supervisorController.js'
import { protect, requireRole } from '../middleware/token.js'

const router = express.Router()

router.get('/suggest', suggestSupervisors) // student-facing; move to studentRoutes if you relocate it

router.use(protect, requireRole('supervisor'))

router.get('/students', getStudentsForSupervisor)
router.get('/requests/pending', getPendingRequestsForSupervisor)
router.patch('/requests/:requestId', respondJoinRequest)
router.patch('/students/:studentId/logbook/:monthId/:weekId/mark', setWeekMark)

export default router