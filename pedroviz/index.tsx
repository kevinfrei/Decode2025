import { serve } from 'bun';
import { Roots } from './server/roots';
import { LoadPaths } from './server/loadpaths';
import { SavePaths } from './server/savepaths';

import index from './index.html';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    // Get the different robot roots ('TeamCode' by default)
    '/api/roots': {
      async GET(req) {
        return Roots();
      },
      async PUT(req) {
        return Roots();
      },
    },
    '/api/loadpaths/:team': async (req) => {
      const team = req.params.team;
      console.log('Loading paths for team:', team);
      return LoadPaths(team);
    },
    '/api/savepaths/:team/:data': async (req) => {
      const team = req.params.team;
      const data = req.params.data;
      console.log('Received team ', team, ' data: ', data);
      return SavePaths(team, data);
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
