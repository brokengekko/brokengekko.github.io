module.exports = {
  entry: './src/main.js', // this is the path to your main JS file
  output: {
    path: `${__dirname}/bin`, // path to where you want the built file
    publicPath: './bin',
    filename: 'bundle.js', // name you want of built file
  },
  devServer: {
    port: 8083,
    historyApiFallback: true,
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  devtool: 'cheap-source-map',
};
