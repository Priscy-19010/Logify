import 'dotenv/config'
import express from 'express'
import cors from 'cors'                    
import connect from './config/connect.js'

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import supervisorRoutes from './routes/supervisorRoutes.js'
import companyRoutes from './routes/companyRoutes.js'

connect()

const app = express()

app.use(cors())                            
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Logify API is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/supervisor', supervisorRoutes)
app.use('/api/company', companyRoutes)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})