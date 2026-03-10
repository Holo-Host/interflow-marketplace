import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || '.*',
      adminCors: process.env.ADMIN_CORS || '.*',
      authCors: process.env.AUTH_CORS || '.*',
      // @ts-ignore
      vendorCors: process.env.VENDOR_CORS || '.*',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret'
    }
  },
  admin: {
    disable: true, 
  },
  plugins: [
    {
      resolve: '@mercurjs/b2c-core',
      options: {}
    },
    {
      resolve: '@mercurjs/commission',
      options: {}
    },
    {
      resolve: '@mercurjs/algolia',
      options: {
        apiKey: process.env.ALGOLIA_API_KEY,
        appId: process.env.ALGOLIA_APP_ID
      }
    },
    {
      resolve: '@mercurjs/reviews',
      options: {}
    },
    {
      resolve: '@mercurjs/requests',
      options: {}
    }
  ],
  modules: [
    {
      resolve: "@medusajs/event-bus-redis",
      key: "event_bus",
      options: { 
        redisUrl: process.env.REDIS_URL 
      },
    },
    {
      resolve: "@medusajs/workflow-engine-redis",
      key: "workflow_engine",
      options: { 
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/cache-redis",
      key: "cache",
      options: { 
        redisUrl: process.env.REDIS_URL 
      },
    },
  ]
})
