import { serve } from 'bun';
import { Roots } from './server/roots';
import { LoadPath } from './server/loadpath';
import { SavePath } from './server/savepath';

import index from './index.html';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,
    // Get the different robot roots ('TeamCode' by default)
    '/api/roots': async (req) => Roots(),
    '/api/loadpath/:team/:path': async (req) =>
      LoadPath(req.params.team, req.params.path),
    '/api/savepath/:team/:path/:data': async (req) =>
      SavePath(req.params.team, req.params.path, req.params.data),
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
