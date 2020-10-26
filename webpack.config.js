const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argsv) => {
    const isDevelopment = argsv.mode !== 'production';

    const config = {
        entry: ['./src/main.js'],
        output: {
            filename: `assets/js/${isDevelopment ? '[name].js' : '[name].[contenthash].js'}`,
            chunkFilename: `assets/js/${isDevelopment ? '[id].js' : '[id].[contenthash].js'}`,
            path: path.resolve(__dirname, 'dist'),
        },
        mode: isDevelopment ? 'development' : 'production',
        optimization: {
            moduleIds: 'deterministic',
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-transform-runtime']
                        }
                    }
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        "vue-style-loader",
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
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment
                            }
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
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isDevelopment
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment
                            }
                        }
                    ]
                },
                {
                    test: /.(png|jpg|gif|bmp|ico)$/i,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: path.resolve(__dirname, 'src'),
                            outputPath: (resourcePath, context) => {
                                return resourcePath;
                            },
                            publicPath: '/',
                            userRelativePaths: false,
                            esModule: false,
                        }
                    }]
                }, {
                    test: /.(eot|svg|ttf|woff(2)?|otf)$/i,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: path.resolve(__dirname, 'src'),
                            outputPath: (resourcePath, context) => {
                                return resourcePath;
                            },
                            publicPath: '/',
                            userRelativePaths: false,
                            esModule: false,
                        }
                    }]
                },
            ]
        },
        plugins: [
            // make sure to include the plugin!
            new HtmlWebpackPlugin({
                template: './src/index.html'
            }),
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: `assets/css/${isDevelopment ? '[name].css' : '[name].[contenthash].css'}`,
                chunkFilename: `assets/css/${isDevelopment ? '[id].css' : '[id].[contenthash].css'}`,
            }),
        ],
        resolve: {
            alias: {
                vue: 'vue/dist/vue.js'
            },
        },
    };

    if (isDevelopment) {
        config.devtool = 'eval-source-map';
    }

    return config;
};