import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['student', 'supervisor', 'company'],
            required: true
        },
        name: {
            type: String,
            required: true
        }, 
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        school: {
            type: String,
        },
        department: {
            type: String,
        },
    }
)

const User = mongoose.model('User', UserSchema)
export default User