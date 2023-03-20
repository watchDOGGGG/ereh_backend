import express from 'express'
import { Db_connection } from './db/index.js'
import { Routes } from './routes/index.js'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendMail } from './middleware/helper/mail.js'

dotenv.config()

const app = express()
Db_connection()

app.use(express())
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000',' https://tech-space-eight.vercel.app']
}))
app.use('/files',express.static('./'))
app.use('/v1/api',Routes)



app.listen(1300,() =>{
    console.log('app started on port 1300')
}) 