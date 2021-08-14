const cache = '4';

// Inside vue.config.js
module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    name: "AH Parser",
    themeColor: "#111827",
    msTileColor: "#111827",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    assetsVersion: "3",

    iconPaths: {
      favicon32: `img/icons${cache}/favicon-32x32.png`,
      favicon16: `img/icons${cache}/favicon-16x16.png`,
      appleTouchIcon: `img/icons${cache}/apple-touch-icon-152x152.png`,
      maskIcon: `img/icons${cache}/safari-pinned-tab.svg`,
      msTileImage: `img/icons${cache}/msapplication-icon-144x144.png`,
    },

    manifestOptions: {
      icons: [
        {
          src: `./img/icons${cache}/android-chrome-192x192.png`,
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: `./img/icons${cache}/android-chrome-512x512.png`,
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: `./img/icons${cache}/android-chrome-maskable-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: `./img/icons${cache}/android-chrome-maskable-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },

    // configure the workbox plugin
    workboxOptions: {
      maximumFileSizeToCacheInBytes: 5000000,
      navigateFallback: "/index.html",
      // Do not precache images
      exclude: [/\.(?:png|jpg|jpeg|svg)$/],

      // Define runtime caching rules.
      runtimeCaching: [
        {
          // Match any request that ends with .png, .jpg, .jpeg or .svg.
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

          // Apply a cache-first strategy.
          handler: "CacheFirst",

          options: {
            // Use a custom cache name.
            cacheName: "images",

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
          handler: "NetworkFirst",

          options: {
            cacheName: "package_slip_list",

            // Only cache 5 listings.
            expiration: {
              maxEntries: 5,
              maxAgeSeconds: 31556926,
            },
          },
        },
        {
          // Match any request that starts with /api/v1/fetch
          urlPattern: /\..+\/api\/v.\/fetch\/.+$/,

          // Apply a network-first strategy.
          handler: "NetworkFirst",

          options: {
            cacheName: "package_slips",

            // Only cache 100 entries.
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 31556926,
            },
          },
        },
      ],
    },
  },
};
