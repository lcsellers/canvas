const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const title = `Conway's Game of Life`
const copyAssets = fs.existsSync(path.join(__dirname, 'assets'))

const plugins = [
	new HtmlWebpackPlugin({
		template: './src/index.html',
		title
	}),
	new CleanWebpackPlugin()
]
if(copyAssets) {
	plugins.push(new CopyPlugin([
		{ from: 'assets' }
	]))
}

module.exports = {
	name: title,
	entry: './src/main.ts',
	mode: 'development',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [new TsconfigPathsPlugin()]
	},
	devServer: {
		contentBase: './dist'
	},
	plugins,
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	},
}