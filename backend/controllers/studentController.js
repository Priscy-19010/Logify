import Profile from '../models/StudentProfile.js'
import Request from '../models/JoinRequest.js'
import Logbook from '../models/Logbook.js'
import CompanyRequest from '../models/CompanyRequest.js'

export const saveStudentProfile = async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ userId: req.user.id })

        if (!existingProfile){
            const newProfile = await Profile.create({
                ...req.body,
                userId: req.user.id,
                matricnumber: req.body.matricnumber.trim().toLowerCase()
            })
            res.status(200).json(newProfile)
        } else {
            const updateData = { ...req.body }

            if (updateData.durationMonths !== undefined) {
                const acceptedRequest = await Request.findOne({
                    studentId: req.user.id,
                    status: 'accepted'
                })

                if (acceptedRequest) {
                    delete updateData.durationMonths
                }
            }

            const updateProfile = await Profile.findByIdAndUpdate(
                existingProfile._id,
                updateData,
                { new: true }
            )
            res.status(200).json(updateProfile)
        }

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getStudentProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id })

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' })
        }

        res.status(200).json(profile)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const sendJoinRequest = async (req, res) => {
    try {
        const studentId = req.user.id
        const supervisorId = req.body.supervisorId

        const existingRequest = await Request.findOne({
            studentId,
            status: { $ne: 'declined' }   // find a document where status is anything except 'declined'
        })

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a join request in progress' })
        }

        const newRequest = await Request.create({
            studentId,
            supervisorId,
            status: 'pending'
        })

        res.status(201).json(newRequest)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getJoinRequestForStudent = async (req, res) => {
    try {
        const request = await Request.findOne({ studentId: req.user.id }).populate('supervisorId', 'name email')

        if (!request) {
            return res.status(404).json({ message: 'No join request found' })
        }

        res.status(200).json(request)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getLogbook = async (req, res) => {
    try {
        const log = await Logbook.findOne({ studentId: req.user.id })

        if (!log) {
            return res.status(404).json({message: "No supervisor has accepted your request yet, so there's nothing to show."})
        }

        res.status(200).json(log)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateDayEntry = async (req, res) => {
    try {
        const { monthId, weekId, dayId } = req.params
        const text = req.body.text

        const logbook = await Logbook.findOne({ studentId: req.user.id })

        if (!logbook) {
            return res.status(404).json({ message: 'No logbook found' })
        }

        const month = logbook.months.id(monthId)
        if (!month) {
            return res.status(404).json({ message: 'Month not found' })
        }

        if (month.locked) {
            return res.status(400).json({ message: 'This month is locked and can no longer be edited' })
        }

        const week = month.weeks.id(weekId)
        if (!week) {
            return res.status(404).json({ message: 'Week not found' })
        }

        const day = week.days.id(dayId)
        if (!day) {
            return res.status(404).json({ message: 'Day not found' })
        }

        if (day.submitted || day.approved) {
            return res.status(400).json({ message: 'This day has already been submitted and cannot be edited' })
        }

        day.text = text
        day.filled = text.trim().length > 0

        await logbook.save()

        res.status(200).json(day)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const submitDay = async (req, res) => {
    try {
        const { monthId, weekId, dayId } = req.params

        const logbook = await Logbook.findOne({ studentId: req.user.id })
        if (!logbook) {
            return res.status(404).json({ message: 'No logbook found' })
        }

        const month = logbook.months.id(monthId)
        if (!month) {
            return res.status(404).json({ message: 'Month not found' })
        }

        if (month.locked) {
            return res.status(400).json({ message: 'This month is locked' })
        }

        const week = month.weeks.id(weekId)
        if (!week) {
            return res.status(404).json({ message: 'Week not found' })
        }

        const day = week.days.id(dayId)
        if (!day) {
            return res.status(404).json({ message: 'Day not found' })
        }

        if (!day.filled) {
            return res.status(400).json({ message: 'Cannot submit an empty day' })
        }

        if (day.approved) {
            return res.status(400).json({ message: 'This day has already been approved' })
        }

        day.submitted = true

        await logbook.save()

        res.status(200).json(day)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const submitMonth = async (req, res) => {
    try {
        const { monthId } = req.params
        const { secondPartyEmail } = req.body

        const logbook = await Logbook.findOne({ studentId: req.user.id })
        if (!logbook) {
            return res.status(404).json({ message: 'No logbook found' })
        }

        const month = logbook.months.id(monthId)
        if (!month) {
            return res.status(404).json({ message: 'Month not found' })
        }

        if (month.locked) {
            return res.status(400).json({ message: 'This month is already locked' })
        }

        const allApproved = month.weeks.every((week) =>
            week.days.every((day) => day.approved)
        )

        if (!allApproved) {
            return res.status(400).json({ message: 'Every day must be approved before submitting the month' })
        }

        month.submitted = true
        month.locked = true
        month.secondPartyEmail = secondPartyEmail
        month.submittedAt = new Date()

        await logbook.save()

        res.status(200).json(month)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const sendCompanyRequest = async (req, res) => {
    try {
        const studentId = req.user.id
        const { companyId, staffName, staffPhone } = req.body

        const existingRequest = await CompanyRequest.findOne({
            studentId,
            status: { $ne: 'declined' }
        })

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a company request in progress' })
        }

        const newRequest = await CompanyRequest.create({
            studentId,
            companyId,
            staffName,
            staffPhone,
            status: 'pending'
        })

        res.status(201).json(newRequest)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getCompanyRequestForStudent = async (req, res) => {
    try {
        const request = await CompanyRequest.findOne({ studentId: req.user.id }).populate('companyId', 'name email')

        if (!request) {
            return res.status(404).json({ message: 'No company request found' })
        }

        res.status(200).json(request)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
