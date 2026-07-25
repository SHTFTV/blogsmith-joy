import { createFileRoute } from '@tanstack/react-router';
import identityContent from '../../public/identity.txt?raw';

export const Route = createFileRoute('/.well-known/identity[.]txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(identityContent, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
});
