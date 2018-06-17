const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../web-ui-dist')
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    mode: 'development',
    module: {
        rules: [
            // this will apply to `.vue` files
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // this will apply to both plain `.scss, .sass` files AND `<style lang="scss">` blocks in `.vue` files
            {
                test: /\.(scss|sass)$/i,
                use: [
                   'vue-style-loader',
                   'css-loader',
                   'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new WebpackBuildNotifierPlugin({
            successSound: false,
            suppressSuccess: true
        })
    ]
}