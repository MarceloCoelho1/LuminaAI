import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersPrismaRepository } from './repository/users.prisma.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUsersRepository',
      useClass: UsersPrismaRepository
    }
  ],
  exports: ['IUsersRepository']
})
export class UsersModule { }
