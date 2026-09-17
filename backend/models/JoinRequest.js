import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: false // no unique to allow student to submit twice when 1st was declined
        },
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            required: true,
            default: 'pending'
        }
    }, 
    {
        timestamps: true
    }

)

const Request = mongoose.model("Request", RequestSchema)
export default Request