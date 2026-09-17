import Request from '../models/JoinRequest.js'
import User from '../models/User.js'
import Logbook from '../models/Logbook.js'
import Profile from '../models/StudentProfile.js'

export const respondJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const { decision } = req.body // expected: 'accepted' or 'declined'

        if (!['accepted', 'declined'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be accepted or declined' })
        }

        const request = await Request.findById(requestId)

        if (!request) {
            return res.status(404).json({ message: 'Request not found' })
        }

        if (request.supervisorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'This request does not belong to you' })
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been responded to' })
        }

        request.status = decision
        await request.save()

        if (decision === 'accepted') {
            const existingLogbook = await Logbook.findOne({ studentId: request.studentId })

            if (!existingLogbook) {
                const studentProfile = await Profile.findOne({ userId: request.studentId })
                const numMonths = studentProfile?.durationMonths || 3 // if profile is missing
                const now = new Date()
                const months = []
    
                for (let m = 0; m < numMonths; m++) {
                    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1)
                    const label = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                    const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
                    const weeks = []

                    for (let w = 0; w < 4; w++) {
                        const days = []
                        for (let d = 0; d < 5; d++) {
                            days.push({
                            label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][d],
                            text: '',
                            filled: false,
                            submitted: false,
                            approved: false,
                        })
                    }
                weeks.push({ label: `Week ${w + 1}`, days, weekDone: false })
            }

            months.push({
                label,
                deadline: lastDay,
                weeks,
                submitted: false,
                locked: false,
                secondPartyEmail: null,
            })
        }

        await Logbook.create({
            studentId: request.studentId,
            months
        })
    }
}

        res.status(200).json(request)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// NOTE: placed here for now, but this is student-facing (a student searching
// for a supervisor to send a request to) — worth moving to studentController.js
// once you've settled where it belongs.
export const suggestSupervisors = async (req, res) => {
    try {
        const { school, department } = req.query

        const filter = { role: 'supervisor' }
        if (school) filter.school = school
        if (department) filter.department = department

        const supervisors = await User.find(filter).select('name email school department')

        res.status(200).json(supervisors)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getStudentsForSupervisor = async (req, res) => {
    try {
        const acceptedRequests = await Request.find({
            supervisorId: req.user.id,
            status: 'accepted'
        })

        const students = await Promise.all(
            acceptedRequests.map(async (request) => {
                const profile = await Profile.findOne({ userId: request.studentId })
                const logbook = await Logbook.findOne({ studentId: request.studentId })
                return { studentId: request.studentId, profile, logbook }
            })
        )

        res.status(200).json(students)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getPendingRequestsForSupervisor = async (req, res) => {
    try {
        const pendingRequests = await Request.find({
            supervisorId: req.user.id,
            status: 'pending'
        }).populate('studentId', 'name email')

        const withProfiles = await Promise.all(
            pendingRequests.map(async (request) => {
                const profile = await Profile.findOne({ userId: request.studentId._id })
                return { ...request.toObject(), profile }
            })
        )

        res.status(200).json(withProfiles)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const setWeekMark = async (req, res) => {
    try {
        const { studentId, monthId, weekId } = req.params
        const { mark } = req.body

        if (typeof mark !== 'number' || mark < 0 || mark > 5) {
            return res.status(400).json({ message: 'Mark must be a number between 0 and 5' })
        }

        const acceptedRequest = await Request.findOne({
            studentId,
            supervisorId: req.user.id,
            status: 'accepted'
        })

        if (!acceptedRequest) {
            return res.status(403).json({ message: 'This student is not assigned to you' })
        }

        const logbook = await Logbook.findOne({ studentId })
        if (!logbook) {
            return res.status(404).json({ message: 'No logbook found' })
        }

        const month = logbook.months.id(monthId)
        if (!month) {
            return res.status(404).json({ message: 'Month not found' })
        }

        const week = month.weeks.id(weekId)
        if (!week) {
            return res.status(404).json({ message: 'Week not found' })
        }

        week.weekMark = mark

        await logbook.save()

        res.status(200).json(week)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}