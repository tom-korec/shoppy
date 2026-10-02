import { Module } from '@nestjs/common';
import { HouseholdsModule } from '../households/households.module.js';
import { AcceptInvitationEndpoint } from './endpoints/accept-invitation.endpoint.js';
import { CreateInvitationEndpoint } from './endpoints/create-invitation.endpoint.js';
import { DeclineInvitationEndpoint } from './endpoints/decline-invitation.endpoint.js';
import { ListInvitationsEndpoint } from './endpoints/list-invitations.endpoint.js';
import { ListPendingInvitationsEndpoint } from './endpoints/list-pending-invitations.endpoint.js';
import { PreviewInvitationEndpoint } from './endpoints/preview-invitation.endpoint.js';
import { RevokeInvitationEndpoint } from './endpoints/revoke-invitation.endpoint.js';
import { InvitationRedemptionService } from './invitation-redemption.service.js';
import { InvitationsService } from './invitations.service.js';

@Module({
  imports: [HouseholdsModule],
  controllers: [
    CreateInvitationEndpoint,
    ListInvitationsEndpoint,
    RevokeInvitationEndpoint,
    ListPendingInvitationsEndpoint,
    PreviewInvitationEndpoint,
    AcceptInvitationEndpoint,
    DeclineInvitationEndpoint,
  ],
  providers: [InvitationsService, InvitationRedemptionService],
})
export class InvitationsModule {}
