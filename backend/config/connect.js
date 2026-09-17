import mongoose from 'mongoose'

export default async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected`)
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`)
        process.exit(1)   // shuts down Node process
    }
}