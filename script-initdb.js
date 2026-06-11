import { prisma } from './lib/prisma.js'

async function main() {
    const user = await prisma.user.upsert({
        where: {
            username: 'guest'
        },
        update: {},
        create: {
            fullname: 'Guest User',
            username: 'guest',
            hashedPassword: 'mock-hashed-password'
        }
    })

    const post = await prisma.post.create({
        data: {
            title: 'Hello World',
            body: 'This is a mock blog post.',
            isPublished: true,
            author: {
                connect: {
                    username: user.username
                }
            }
        }
    })

    const comment = await prisma.comment.create({
        data: {
            text: 'This is a mock comment.',
            commenter: {
                connect: {
                    username: user.username
                }
            },
            commentOn: {
                connect: {
                    id: post.id
                }
            }
        }
    })

    console.log({
        user,
        post,
        comment
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })
