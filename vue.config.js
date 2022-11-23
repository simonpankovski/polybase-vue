module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    public: '0.0.0.0:8080',
  },
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(hdr)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                limit: 8192
              }
            }
          ]
        }
      ]
    }
  }
};
