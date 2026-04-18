import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
    const users = await prisma.ryzera_pos_user.findMany()
    console.log(users)
}

test()