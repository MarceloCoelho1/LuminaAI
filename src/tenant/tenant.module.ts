import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantPrismaRepository } from './repository/tenant.prisma.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantController],
  providers: [
    TenantService,
    {
      provide: 'ITenantRepository',
      useClass: TenantPrismaRepository
    }
  ],
})
export class TenantModule { }
