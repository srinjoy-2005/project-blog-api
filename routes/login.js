import express from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { validateLoginData } from '../helpers/sign-up-validation.js'
import { signToken } from '../helpers/jwthelper.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Login API endpoint' })
})

router.post('/', async (req, res) => {
  try {
    // console.log(req.body);
    
    const { isValid, errors, credentials } = validateLoginData(req.body)

    if (!isValid) {
      return res.status(400).json({ errors })
    }

    const user = await prisma.user.findUnique({
      where: { username: credentials.username }
    })

    if (!user) {
      return res.status(401).json({ error: 'Incorrect username or password.' })
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.hashedPassword)
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Incorrect username or password.' })
    }

    const token = signToken({
      id: user.id,
      username: user.username
    })

    res.setHeader('Authorization', `Bearer ${token}`)

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        accountCreationDate: user.accountCreationDate
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
