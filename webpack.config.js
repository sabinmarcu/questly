var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve(__dirname, 'build');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var devFlagPlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false')),
    __CHROMEAPP__: JSON.stringify(JSON.parse((process.env.ENV || "browser").toLowerCase() === "chrome" || 'false')),
    __NAME__: `"${(process.env.SITENAME || "Questly")}"`,
    __BASEURL__: `"${(process.env.BASEURL || "/")}"`,
});

var config = {
    //Entry points to the project
    entry: {
        app: [
            'webpack/hot/dev-server',
            'webpack/hot/only-dev-server',
            path.join(__dirname, '/src/app/app.jsx'),
        ], bootstrap: [
            path.join(__dirname, '/src/bootstrap.js'),
        ]
    },
    //Config options on how to interpret requires imports
    resolve: {
        extensions: ["", ".js", ".jsx", ".css", ".styl", ".ls", ".lson"],
        node_modules: ["web_modules", "node_modules", "bower_components"],
        root: [path.join(__dirname, "bower_components"), path.join(__dirname, "node_modules")],
    },
    //Server Configuration options
    devServer:{
        contentBase: '',    //Relative directory for base of server
        devtool: 'eval',
        hot: true,                //Live-reload
        inline: true,
        port: 3000,             //Port Number
    },
    devtool: 'eval',
    output: {
        path: buildPath,        //Path of output file
        filename: '[name].js',
    },
    plugins: [
        //Enables Hot Modules Replacement
        new webpack.HotModuleReplacementPlugin(),
        //Allows error warnings but does not stop compiling. Will remove when eslint is added
        new webpack.NoErrorsPlugin(),
        //Moves files
        new TransferWebpackPlugin([
            {from: 'www'},
        ], path.resolve(__dirname, "src")),
        devFlagPlugin,
        // {
        //     "definitions": {
        //         "process.env": {
        //             "NODE_ENV": "\"development\"",
        //             "IS_BROWSER": true,
        //         },
        //     },
        // },
    ],
    module: {
        //Loaders to interpret non-vanilla javascript code as well as most other extensions including images and text.
        preLoaders: [
            {
                //Eslint loader
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                include: [path.resolve(__dirname, "src/app")],
                exclude: [nodeModulesPath],
            },
        ],
        loaders: [
            {
                //React-hot loader and
                test: /\.(js|jsx)$/,    //All .js and .jsx files
                loaders: ['react-hot','babel-loader?stage=0'], //react-hot is like browser sync and babel loads jsx and es6-7
                exclude: [nodeModulesPath],
            },
            {
                test: /\.css$/,
                loader: "style!css?modules",
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?.+)?$/,
                loader: "url",
            },
            {
                test: /\.styl$/,
                loader: 'style-loader!css-loader?modules!stylus-loader',
            },
            {
                test: /\.ls$/,
                loader: 'livescript',
            },
            {
                test: /\.lson$/,
                loader: 'lson-loader',
            },
        ],
        "noParse": /lie\.js$|\/leveldown\//
    },
    //eslint config options. Part of the eslint-loader package
    eslint: {
        configFile: '.eslintrc',
    },
};

module.exports = config;
