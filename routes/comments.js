//this is nested under posts/:id

import express from 'express'
import { prisma } from '../lib/prisma.js'

const router = express.Router({ mergeParams: true })

router.use(express.json())

//get all comments for a post
router.get('/', async (req, res, next) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                commentOnId: parseInt(req.params.id)
            },
            orderBy: {
                createdDate: 'desc'
            }
        })

        res.json(comments)
    } catch (err) {
        next(err)
    }
})

router.get('/:commentId', async (req, res, next) => {
    try {
        const comment = await prisma.comment.findFirst({
            where: {
                id: parseInt(req.params.commentId),
                commentOnId: parseInt(req.params.id)
            }
        })

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' })
        }

        res.json(comment)
    } catch (err) {
        next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { text, commenterUsername } = req.body

        const newComment = await prisma.comment.create({
            data: {
                text,
                commenter: {
                    connect: { username: commenterUsername }
                },
                commentOn: {
                    connect: { id: parseInt(req.params.id) }
                }
            }
        })

        res.status(201).json(newComment)
    } catch (err) {
        next(err)
    }
})

router.delete('/:commentId', async (req, res, next) => {
    try {
        const deleteResult = await prisma.comment.deleteMany({
            where: {
                id: parseInt(req.params.commentId),
                commentOnId: parseInt(req.params.id)
            }
        })

        if (deleteResult.count === 0) {
            return res.status(404).json({ error: 'Comment not found' })
        }

        res.status(204).end()
    } catch (err) {
        next(err)
    }
})

export default router
