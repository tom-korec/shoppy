import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChangePasswordEndpoint } from './endpoints/change-password.endpoint.js';
import { GetMeEndpoint } from './endpoints/get-me.endpoint.js';
import { UpdateMeEndpoint } from './endpoints/update-me.endpoint.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [AuthModule],
  controllers: [GetMeEndpoint, UpdateMeEndpoint, ChangePasswordEndpoint],
  providers: [UsersService],
})
export class UsersModule {}
