import express from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { validateSignupData } from '../helpers/sign-up-validation.js'

const router = express.Router()
const salt = 10

async function generateHash(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds)
}

router.get('/', (req, res) => {
  res.json({ message: 'Sign-up API endpoint' })
})

router.post('/', async (req, res) => {
  try {
    const { isValid, dbData, errors } = validateSignupData(req.body)

    if (!isValid) {
      return res.status(400).json({ errors })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: dbData.username }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists. Please choose another one.' })
    }

    const hashedPassword = await generateHash(dbData.rawPassword, salt)

    const user = await prisma.user.create({
      data: {
        username: dbData.username,
        fullname: dbData.fullname,
        hashedPassword
      }
    })

    return res.status(201).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      accountCreationDate: user.accountCreationDate
    })
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Username already exists. Please choose another one.' })
    }

    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router;
