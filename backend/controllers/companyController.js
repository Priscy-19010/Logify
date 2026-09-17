import Profile from '../models/StudentProfile.js'
import Logbook from '../models/Logbook.js'
import User from '../models/User.js'
import CompanyRequest from '../models/CompanyRequest.js'

export const getStudentsForCompany = async (req, res) => {
    try {
        const profiles = await Profile.find({ companyId: req.user.id }).populate('userId', 'name email')

        const students = await Promise.all(
            profiles.map(async (profile) => {
                const logbook = await Logbook.findOne({ studentId: profile.userId })
                return { studentId: profile.userId._id, profile, logbook }
            })
        )

        res.status(200).json(students)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getPendingDaySubmissionsForCompany = async (req, res) => {
    try {
        const profiles = await Profile.find({ companyId: req.user.id })
        const profileByStudentId = new Map(profiles.map((p) => [p.userId.toString(), p]))
        const studentIds = profiles.map((p) => p.userId)

        const logbooks = await Logbook.find({ studentId: { $in: studentIds } })

        const pending = []

        logbooks.forEach((logbook) => {
            const profile = profileByStudentId.get(logbook.studentId.toString())
            logbook.months.forEach((month) => {
                if (month.locked) return // already submitted — nothing here needs approval anymore
                month.weeks.forEach((week) => {
                    week.days.forEach((day) => {
                        if (day.submitted && !day.approved) {
                            pending.push({
                                studentId: logbook.studentId,
                                profile,
                                month,
                                week,
                                day
                            })
                        }
                    })
                })
            })
        })

        res.status(200).json(pending)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const approveDay = async (req, res) => {
    try {
        const { studentId, monthId, weekId, dayId } = req.params

        const profile = await Profile.findOne({ userId: studentId, companyId: req.user.id })
        if (!profile) {
            return res.status(403).json({ message: 'This student is not placed with your company' })
        }

        const logbook = await Logbook.findOne({ studentId })
        if (!logbook) {
            return res.status(404).json({ message: 'No logbook found' })
        }

        const month = logbook.months.id(monthId)
        if (!month || month.locked) {
            return res.status(400).json({ message: 'This month cannot be modified' })
        }

        const week = month.weeks.id(weekId)
        if (!week) {
            return res.status(404).json({ message: 'Week not found' })
        }

        const day = week.days.id(dayId)
        if (!day) {
            return res.status(404).json({ message: 'Day not found' })
        }

        if (!day.submitted || day.approved) {
            return res.status(400).json({ message: 'This day is not awaiting approval' })
        }

        day.approved = true
        day.approvedAt = new Date()
        day.approvedBy = req.user.id

        week.weekDone = week.days.length > 0 && week.days.every((d) => d.approved)

        await logbook.save()

        res.status(200).json(day)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const listCompanies = async (req, res) => {
    try {
        const companies = await User.find({ role: 'company' }).select('name email')
        res.status(200).json(companies)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getPendingCompanyRequestsForCompany = async (req, res) => {
    try {
        const pendingRequests = await CompanyRequest.find({
            companyId: req.user.id,
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

export const respondCompanyRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const { decision } = req.body

        if (!['accepted', 'declined'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be accepted or declined' })
        }

        const request = await CompanyRequest.findById(requestId)
        if (!request) {
            return res.status(404).json({ message: 'Request not found' })
        }

        if (request.companyId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to respond to this request' })
        }

        request.status = decision
        await request.save()

        if (decision === 'accepted') {
            const company = await User.findById(req.user.id)
            await Profile.findOneAndUpdate(
                { userId: request.studentId },
                {
                    companyId: request.companyId,
                    companyName: company?.name,
                    staffName: request.staffName,
                    staffPhone: request.staffPhone,
                }
            )
        }

        res.status(200).json(request)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}