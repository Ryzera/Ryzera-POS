/*import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller("test")
export class TestController {
  constructor(private prisma: PrismaService) {}

  @Get("db")
  async testDb() {
    const res = await this.prisma.$queryRaw`SELECT NOW()`;
    console.log("Database response:", res);
    return res;
  }
}
*/