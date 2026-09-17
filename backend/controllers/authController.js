import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import Profile from '../models/StudentProfile.js'
import Request from '../models/JoinRequest.js'
import Logbook from '../models/Logbook.js'
import CompanyRequest from '../models/CompanyRequest.js'

export const signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.email.trim().toLowerCase()})

        if (!existingUser){
            const hashed = await bcrypt.hash(req.body.password, 10)
            const newUser = await User.create({
                ...req.body, // put above alterations to not overide them
                email: req.body.email.trim().toLowerCase(),
                password: hashed //idk how to hash
            })

            // log them in
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

            res.status(200).json({
                token,
                id: newUser._id,
                role: newUser.role,
                name: newUser.name,
                email: newUser.email,
            })
        } else {
            res.status(401).json({message: "User already exists"})
        }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const login = async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.email.trim().toLowerCase()})

        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const passwordMatches = await bcrypt.compare(req.body.password, existingUser.password)

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

        res.status(200).json({
            token,
            id: existingUser._id,
            role: existingUser.role,
            name: existingUser.name,
            email: existingUser.email,
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMe = async (req, res) => {
    res.status(200).json(req.user)
}

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id
        const role = req.user.role

        if (role === 'student') {
            await Profile.deleteOne({ userId })
            await Logbook.deleteOne({ studentId: userId })
            await Request.deleteMany({ studentId: userId })
            await CompanyRequest.deleteMany({ studentId: userId })
        }

        if (role === 'supervisor') {
            await Request.deleteMany({ supervisorId: userId })
        }

        if (role === 'company') {
            await CompanyRequest.deleteMany({ companyId: userId })
            await Profile.updateMany(
                { companyId: userId },
                { $unset: { companyId: '', companyName: '', staffName: '', staffPhone: '' } }
            )
        }

        await User.findByIdAndDelete(userId)

        res.status(200).json({ message: 'Account deleted' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}