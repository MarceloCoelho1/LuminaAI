import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService {

    private readonly adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL
    });
    private readonly prisma = new PrismaClient({ adapter: this.adapter });

    async onModuleInit() {
        await this.prisma.$connect();
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }

    get client(): PrismaClient {
        return this.prisma;
    }
}
