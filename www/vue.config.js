// Inside vue.config.js
module.exports = { 
    // ...other vue-cli plugin options...
    pwa: {
        name: 'AH Parser UI',
        themeColor: '#4DBA87',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',

        // configure the workbox plugin
        workboxOptions: {
            maximumFileSizeToCacheInBytes: 5000000,
            navigateFallback: '/index.html',
            // Do not precache images
            exclude: [/\.(?:png|jpg|jpeg|svg)$/],

            // Define runtime caching rules.
            runtimeCaching: [
                {
                    // Match any request that ends with .png, .jpg, .jpeg or .svg.
                    urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

                    // Apply a cache-first strategy.
                    handler: 'CacheFirst',

                    options: {
                        // Use a custom cache name.
                        cacheName: 'images',

                        // Only cache 10 images.
                        expiration: {
                            maxEntries: 15,
                        },
                    },
                },
                {
                    // Match any request that starts with /api/v1/fetch
                    urlPattern: /\..+\/api\/v.\/fetch\/.+$/,

                    // Apply a cache-first strategy.
                    handler: 'CacheFirst',

                    options: {
                        // Use a custom cache name.
                        cacheName: 'data',

                        // Only cache 10 images.
                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 31556926
                        },
                    },
                }
            ],
        }
    }
}