import { Global, Module } from '@nestjs/common';
import { ScopeAccess } from './scope-access.service.js';

@Global()
@Module({
  providers: [ScopeAccess],
  exports: [ScopeAccess],
})
export class ScopeModule {}
