// Inside vue.config.js
module.exports = { 
    // ...other vue-cli plugin options...
    pwa: {
        name: 'AH Parser',
        themeColor: '#111827',
        msTileColor: '#111827',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        assetsVersion: '2',

        iconPaths: {
            favicon32: 'img/icons_2/favicon-32x32.png',
            favicon16: 'img/icons_2/favicon-16x16.png',
            appleTouchIcon: 'img/icons_2/apple-touch-icon-152x152.png',
            maskIcon: 'img/icons_2/safari-pinned-tab.svg',
            msTileImage: 'img/icons_2/msapplication-icon-144x144.png'
        },

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
                    urlPattern: /\..+\/api\/v.\/fetch/,

                    // Apply a network-first strategy.
                    handler: 'NetworkFirst',

                    options: {
                        cacheName: 'package_slip_list',

                        // Only cache 5 listings.
                        expiration: {
                            maxEntries: 5,
                            maxAgeSeconds: 31556926
                        },
                    },
                },
                {
                    // Match any request that starts with /api/v1/fetch
                    urlPattern: /\..+\/api\/v.\/fetch\/.+$/,

                    // Apply a network-first strategy.
                    handler: 'NetworkFirst',

                    options: {
                        cacheName: 'package_slips',

                        // Only cache 100 entries.
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