let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer }) => {
    // Suppress warnings for OpenTelemetry, require-in-the-middle, and Lighthouse
    config.ignoreWarnings = [
      {
        module: /require-in-the-middle/,
      },
      {
        module: /@opentelemetry/,
      },
      {
        module: /lighthouse/,
      },
      {
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
      {
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        message: /Critical dependency: Accessing import\.meta directly is unsupported/,
      },
      {
        message: /Serializing big strings/,
      },
    ];

    // Additional configuration for server-side builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'require-in-the-middle': 'commonjs require-in-the-middle',
      });
    }

    return config;
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
