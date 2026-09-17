import express from 'express'
import {
    getStudentsForCompany,
    getPendingDaySubmissionsForCompany,
    approveDay,
    listCompanies,
    getPendingCompanyRequestsForCompany,
    respondCompanyRequest 
} from '../controllers/companyController.js'
import { protect, requireRole } from '../middleware/token.js'

const router = express.Router()

router.get('/list', listCompanies)

router.use(protect, requireRole('company'))

router.get('/students', getStudentsForCompany)
router.get('/submissions/pending', getPendingDaySubmissionsForCompany)
router.patch('/logbook/:studentId/:monthId/:weekId/:dayId/approve', approveDay)
router.get('/requests/pending', getPendingCompanyRequestsForCompany)
router.patch('/requests/:requestId', respondCompanyRequest)

export default router