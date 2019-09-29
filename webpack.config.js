const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const entries = fs.readdirSync(__dirname)
	.filter(dir => fs.existsSync(path.join(dir, 'webpack.config.js')) && dir[0] !== '_')
	.map(dir => ({
		dir,
		title: require(path.join(__dirname, dir, 'webpack.config.js')).name
	}))

const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		template: './index.html',
		inject: false,
		templateParameters: { entries }
	})
]
const copy = []

entries.forEach(({ dir, title }) => {
	plugins.push(new HtmlWebpackPlugin({
		template: `./${dir}/src/index.html`,
		filename: `${dir}/index.html`,
		title,
		chunks: [dir]
	}))
	if(fs.existsSync(path.join(__dirname, dir, 'assets'))) {
		copy.push({
			from: `${dir}/assets`,
			to: `dist/${dir}`
		})
	}
})
if(copy.length) {
	plugins.push(new CopyPlugin(copy))
}

module.exports = {
	entry: entries.reduce((entry, { dir }) => ({
		...entry,
		[dir]: `${dir}/src/main.ts`
	}), {}),
	mode: 'production',
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
		filename: '[name]/main.js',
		path: path.resolve(__dirname, 'dist')
	},
}