import express from 'express'
import { prisma } from '../lib/prisma.js'
// import { v4 as uuidv4 } from "uuid";
import commentRouter from './comments.js'
import { verifyToken, optionalVerifyToken } from '../helpers/jwthelper.js'

const router = express.Router()


//only for posts/:id to extract id directly
function getPostId(req, res) {
    const id = parseInt(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ error: 'Invalid post id' })
        return null
    }

    return id
}

function getPostData(req, res) {
    const { title, body } = req.body || {}

    if (!title || !body) {
        res.status(400).json({ error: 'Title and body are required' })
        return null
    }

    return { title, body }
}

// function getUsername(req) {
//     const username = req.query.username || req.body.authorUsername || 'guest'
//     return username.toString().trim() || 'guest'
// }

// TODO - protect routes with passport
// for non-login, show only post title and body, not creator info, date, etc
// non-login users can post using guest account if no username is supplied
//todo- put route for updating post status(publish)



//view posts
//todo- review what to send if logged in user
//all data of all posts shouldnt be sent
router.get('/', optionalVerifyToken, async (req, res, next) => {
  try {
    const postList = await prisma.post.findMany()

    if (!req.user) {
      const publicPosts = postList.map(post => ({
        id: post.id,
        title: post.title,
        body: post.body
      }))
      return res.json(publicPosts)
    }

    res.json(postList)
  } catch (err) {
    next(err)
  }
})

//create new post
router.post('/',optionalVerifyToken, async (req,res,next)=>{
    try {
        const postData = getPostData(req, res)

        if (!postData) {
            return
        }

        const authorUsername = req.user??='guest';

        const newpost = await prisma.post.create({
            data: {
                title: postData.title,
                body: postData.body,
                authorUsername
            }
        })

        //201 means created successfully
        res.status(201).json(newpost)
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(400).json({ error: 'Author not found' })
        }

        next(err)
    }
})

router.get('/:id', async (req,res,next)=>{
    try {
        const id = getPostId(req, res)

        if (id === null) {
            return
        }

        const post = await prisma.post.findUnique({
            where: {
                id
            }
        });

        // If post doesn't exist, return 404
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (err) {
        next(err)
    }
});


// Returned:
// 403 if the authenticated user does not own the post
// 404 if the post is missing
// 204 on successful delete
router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const id = getPostId(req, res)
        const postData = getPostData(req, res)

        if (id === null || !postData) {
            return
        }

        const existingPost = await prisma.post.findUnique({
            where: { id }
        })

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' })
        }

        if (existingPost.authorUsername !== req.user?.username) {
            return res.status(403).json({ error: 'You are not authorized to update this post.' })
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                title: postData.title,
                body: postData.body
            }
        })

        res.json(updatedPost)
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Post not found' })
        }

        next(err)
    }
})

router.post('/:id', async (req, res, next) => {
    res.redirect(307, '/:id')//forces put redirect
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const id = getPostId(req, res)

        if (id === null) {
            return
        }

        const existingPost = await prisma.post.findUnique({
            where: { id }
        })

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' })
        }

        if (existingPost.authorUsername !== req.user?.username) {
            return res.status(403).json({ error: 'You are not authorized to delete this post.' })
        }

        await prisma.post.delete({
            where: { id }
        })

        res.status(204).end()
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Post not found' })
        }

        next(err)
    }
})

router.use('/:id/comments', commentRouter);

export default router;
