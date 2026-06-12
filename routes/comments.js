//this is nested under posts/:id

import express from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyToken } from '../helpers/jwthelper.js'

const router = express.Router({ mergeParams: true })

router.use(express.json())

//get all comments for a post
//doesnt need auth
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

//get particular comment
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

//post a comment
//only login uesrs can comment
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id)
        const { text, commenterUsername } = req.body

        if (Number.isNaN(postId) || !text || !commenterUsername) {
            return res.status(400).json({
                error: 'Post id, text, and commenterUsername are required.'
            })
        }

        const [post, user] = await Promise.all([
            prisma.post.findUnique({ where: { id: postId } }),
            prisma.user.findUnique({ where: { username: commenterUsername } })
        ])

        if (!post && !user) {
            return res.status(404).json({
                error: 'Post and commenter user were not found.'
            })
        }

        if (!post) {
            return res.status(404).json({ error: 'Post not found.' })
        }

        if (!user) {
            return res.status(404).json({ error: 'Commenter username not found.' })
        }

        const newComment = await prisma.comment.create({
            data: {
                text,
                commenter: {
                    connect: { username: commenterUsername }
                },
                commentOn: {
                    connect: { id: postId }
                }
            }
        })

        res.status(201).json(newComment)
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(400).json({
                error: 'Unable to create comment. Either the post does not exist or the commenter username is invalid.'
            })
        }

        next(err)
    }
})

//delete particular comment
//only logged in
router.delete('/:commentId',  async (req, res, next) => {

    try{
        const id = parseInt(req.params.commentId);
        const existingComment = await prisma.comment.findUnique({
            where: { id }
        })
        console.log(existingComment);

         if (!existingComment) {
            return res.status(404).json({ error: 'Post not found' })
        }

        res.redirect('/')

    }catch(err){
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Post not found' })
        }

        next(err)
    }
})

export default router
