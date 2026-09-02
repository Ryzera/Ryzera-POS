import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Mirrors ALL_PRODUCTS from pos-web-app/.../billing/page.tsx.
// Frontend array is left untouched — this just makes the same
// products exist as real Product + BranchProduct records so
// billing's stock decrement/increment has something to act on.
type SeedProduct = { name: string; sku: string; price: number; stock: number };

const PRODUCTS: SeedProduct[] = [
    { name: 'Basmati Rice 5kg',   sku: 'RC-002', price: 1200, stock: 50  },
    { name: 'Coconut Oil 1L',     sku: 'CO-003', price: 580,  stock: 0   },
    { name: 'Green Tea Bags x20', sku: 'TB-004', price: 320,  stock: 6   },
    { name: 'Full Cream Milk 1L', sku: 'FM-001', price: 480,  stock: 20  },
    { name: 'Cheddar Cheese 200g',sku: 'CC-002', price: 890,  stock: 9   },
    { name: 'T-Shirt — Medium',   sku: 'TS-001', price: 1500, stock: 30  },
    { name: 'Slim Fit Jeans',     sku: 'JN-002', price: 3200, stock: 7   },
    { name: 'Floor Cleaner 1L',   sku: 'FC-001', price: 275,  stock: 40  },
    { name: 'Dish Soap 500ml',    sku: 'DS-002', price: 190,  stock: 25  },
    { name: 'Wireless Earbuds',   sku: 'WE-001', price: 4500, stock: 15  },
    { name: 'USB-C Cable 2m',     sku: 'UC-003', price: 650,  stock: 20  },
    { name: 'Coca Cola 330ml',    sku: 'CC-330', price: 180,  stock: 100 },
    { name: 'Liquid Detergent 1L',sku: 'LD-002', price: 560,  stock: 0   },
    { name: 'Polo Shirt XL',      sku: 'PS-003', price: 1800, stock: 3   },
];

// Round-robin across these three branch codes — adjust here if you
// want a different split or to add/remove branches.
const BRANCH_CODES = ['GAL01', 'KDY', 'HQ'];

async function main() {
    const branches = await prisma.branch.findMany({
        where: { code: { in: BRANCH_CODES } },
    });

    if (branches.length !== BRANCH_CODES.length) {
        const found = branches.map((b: { code: string }) => b.code);
        const missing = BRANCH_CODES.filter((c) => !found.includes(c));
        throw new Error(`Branch code(s) not found: ${missing.join(', ')}`);
    }

    // Keep a stable order matching BRANCH_CODES for round-robin assignment.
    const orderedBranches = BRANCH_CODES.map(
        (code) => branches.find((b: { code: string }) => b.code === code)!,
    );

    for (let i = 0; i < PRODUCTS.length; i++) {
        const p = PRODUCTS[i];
        const branch = orderedBranches[i % orderedBranches.length];
        if (!p || !branch) continue;

        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: {
                name: p.name,
                code: p.sku,
                sku: p.sku,
                price: p.price,
                min_quantity: 0,
                unit: 'PCS',
                status: 'ACTIVE',
                company_id: branch.company_id,
            },
        });

        const existing = await prisma.branchProduct.findFirst({
            where: { branch_id: branch.id, product_id: product.id },
        });

        if (existing) {
            console.log(`Skip (already assigned): ${p.name} → ${branch.code}`);
            continue;
        }

        await prisma.branchProduct.create({
            data: {
                branch_id: branch.id,
                product_id: product.id,
                stockQty: p.stock,
            },
        });

        console.log(`Seeded: ${p.name} → ${branch.code} (qty ${p.stock})`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });