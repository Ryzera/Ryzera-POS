import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.ryzera_pos_sale.findMany()
    console.log(users)
}

main()
