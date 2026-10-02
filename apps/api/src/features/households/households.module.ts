import { Module } from '@nestjs/common';
import { CreateHouseholdEndpoint } from './endpoints/create-household.endpoint.js';
import { DeleteHouseholdEndpoint } from './endpoints/delete-household.endpoint.js';
import { GetHouseholdEndpoint } from './endpoints/get-household.endpoint.js';
import { LeaveHouseholdEndpoint } from './endpoints/leave-household.endpoint.js';
import { ListHouseholdsEndpoint } from './endpoints/list-households.endpoint.js';
import { ListMembersEndpoint } from './endpoints/list-members.endpoint.js';
import { RemoveMemberEndpoint } from './endpoints/remove-member.endpoint.js';
import { RenameHouseholdEndpoint } from './endpoints/rename-household.endpoint.js';
import { TransferOwnershipEndpoint } from './endpoints/transfer-ownership.endpoint.js';
import { UpdateMemberEndpoint } from './endpoints/update-member.endpoint.js';
import { HouseholdsService } from './households.service.js';
import { MembersService } from './members.service.js';

@Module({
  controllers: [
    CreateHouseholdEndpoint,
    ListHouseholdsEndpoint,
    GetHouseholdEndpoint,
    RenameHouseholdEndpoint,
    DeleteHouseholdEndpoint,
    TransferOwnershipEndpoint,
    LeaveHouseholdEndpoint,
    ListMembersEndpoint,
    UpdateMemberEndpoint,
    RemoveMemberEndpoint,
  ],
  providers: [HouseholdsService, MembersService],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}
