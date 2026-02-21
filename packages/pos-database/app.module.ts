import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
//import { TestController } from "./test.controller";

@Module({
  imports: [],
//  controllers: [TestController],
  providers: [PrismaService],
})
export class AppModule {}
