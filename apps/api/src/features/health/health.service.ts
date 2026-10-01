import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HealthResponse } from '@shoppy/shared';
import type { Env } from '../../config/env.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async check(): Promise<HealthResponse> {
    const database = (await this.isDatabaseUp()) ? 'up' : 'down';

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      version: this.config.get('APP_VERSION', { infer: true }),
      checks: { database },
      timestamp: new Date().toISOString(),
    };
  }

  private async isDatabaseUp(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
