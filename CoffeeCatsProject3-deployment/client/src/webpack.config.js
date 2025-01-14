module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
            test: /\.js$/,
            use: ['source-map-loader'],
            enforce: 'pre',
            exclude: [/node_modules\/(?!@mediapipe)/]  // Exclude @mediapipe from source-map-loader
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    stats: {
        warningsFilter: /source-map/,
      },
  };
  