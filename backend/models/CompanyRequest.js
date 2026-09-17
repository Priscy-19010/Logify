import mongoose from 'mongoose'

const CompanyRequestSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        staffName: {
            type: String,
            required: true
        },
        staffPhone: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    },
    { timestamps: true }
)

const CompanyRequest = mongoose.model('CompanyRequest', CompanyRequestSchema)
export default CompanyRequest