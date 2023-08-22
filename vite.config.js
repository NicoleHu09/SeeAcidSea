import vitePluginString from 'vite-plugin-string'
export default {
    plugins: [
        vitePluginString(),
    ],
    build: {
        outDir: 'dist', // 输出目录，默认是 'dist'
        rollupOptions: {
            input: {
                main: 'index.html',
                another: 'Seasonal.html',
                third: 'mainPage.html',
                forth: 'LongitudeAnalysis.html'
            }
        }
    },
    base: '/SeeAcidSea/',
}