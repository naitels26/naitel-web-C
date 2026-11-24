import { createLandingHandler } from '../server.mjs';

// Export the request handler without opening a listening port in Vercel.
export default createLandingHandler();
