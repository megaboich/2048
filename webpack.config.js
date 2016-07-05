var webpack = require('webpack');

module.exports = {
    entry: {
        thirdparty: [
            'pixi.js',
            'mousetrap',
            'file-saver'
        ],

        app: './app/app.ts',
        tests: './tests.js'
    },
    output: {
        filename: './build/[name].js',
        pathinfo: true
    },
    // Turn on sourcemaps
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.ts', '.js',]
    },
    plugins: [
        // remove 3rd patry from app and tests bundles
        new webpack.optimize.CommonsChunkPlugin({ name: 'thirdparty', chunks: ['app'] }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'thirdparty', chunks: ['tests'] }),

        // Add minification
        new webpack.optimize.UglifyJsPlugin(),
    ],
    externals: {
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts' },
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.(png|jpe?g|gif)$/, loader: 'url?limit=100000' },
        ]
    }
}
