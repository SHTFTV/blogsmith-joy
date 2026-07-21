import { createFileRoute } from '@tanstack/react-router';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const Route = createFileRoute('/api/.well-known/identity.txt' as any)({
  server: {
    handlers: {
      GET: async () => {
        const body = readFileSync(join(process.cwd(), 'public/identity.txt'), 'utf8');
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        });
      },
    },
  },
});
