import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        fullname: {
            type: String,
            required: true
        },
        school: {
            type: String,
            required: true
        },
        matricnumber: {
            type: String,
            required: true,
            unique: true
        },
        department: {
            type: String,
            required: true
        },
        level: {
            type: Number,
            enum: [200, 300],
            required: true
        },
        durationMonths: {
            type: Number,
            enum: [3, 6],
            required: true
        },
        companyName: {
            type: String,
            required: false
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        staffPhone: {
            type: String,
            required: false
        },
        staffName: {
            type: String,
            required: false
        },
        confirmed: {
            type: Boolean,
            default: false
        }
    }
)

const Profile = mongoose.model("Profile", ProfileSchema)
export default Profile