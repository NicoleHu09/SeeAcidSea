import vitePluginString from 'vite-plugin-string'
export default {
    optimizeDeps: {
        include: ['three', 'd3', 'gsap', 'echarts', 'papaparse']
    },
    plugins: [
        vitePluginString()
    ]
}