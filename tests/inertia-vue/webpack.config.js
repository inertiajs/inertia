const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: './src/app.js',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'tmp'),
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        extensions: ['*', '.js', '.vue'],
        alias: {
            '@inertiajs/inertia': path.resolve(__dirname, '../../packages/inertia/dist/index.js'),
            '@inertiajs/inertia-vue': path.resolve(__dirname, '../../packages/inertia-vue/dist/index.js')
        }
    },
    stats: 'errors-only',
}
