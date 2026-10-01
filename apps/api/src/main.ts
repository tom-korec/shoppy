import { ConfigService } from '@nestjs/config';
import { createApp } from './bootstrap/create-app.js';
import type { Env } from './config/env.js';

const app = await createApp();
const port = app.get<ConfigService<Env, true>>(ConfigService).get('PORT', { infer: true });

// Cloud Run routes traffic to all interfaces, not just localhost.
await app.listen(port, '0.0.0.0');
