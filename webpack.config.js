const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: ['./src/app.js'],
    output: {
        filename: isDevelopment ? '[name].js' : '[name].[hash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            // ... other rules
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [{
                        loader: "vue-style-loader",
                    },
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            }
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: isDevelopment
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment
                        },
                    }
                ]
            },
            // this will apply to both plain `.js` files
            // AND `<script>` blocks in `.vue` files
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    sourceMap: isDevelopment
                },
            },
            // this will apply to both plain `.css` files
            // AND `<style>` blocks in `.vue` files
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            }
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /.(png|jpg|gif|bmp)$/i,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                        context: path.resolve(__dirname, 'src'),
                        outputPath: (resourcePath, context) => {
                            return path.relative(path.dirname(resourcePath), context).substr(6);
                        },
                        publicPath: '/',
                        userRelativePaths: true
                    }
                }]
            },
        ]
    },
    plugins: [
        // make sure to include the plugin!
        new HtmlWebpackPlugin( {
            template: './src/index.html'
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: isDevelopment ? '[name].css' : '[name].[hash].css',
            chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css',
        }),
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        },
    },
};