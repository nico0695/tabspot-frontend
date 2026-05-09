// Side-effect import: runs env validation when Next loads this config, aborting the CLI on failure.
import './src/lib/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
