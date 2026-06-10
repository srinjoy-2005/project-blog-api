import express from 'express'
import { prisma } from '../lib/prisma'
const router = express.Router()

router.get('/', async (req, res) => {
    const postList = await prisma.post.findMany()
    res.json(postList)
    //TODO - revise ... syntax 
})

export default router