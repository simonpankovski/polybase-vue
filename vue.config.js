module.exports = {
    transpileDependencies: ["vuetify"],
    // devServer: {
    //     host: "localhost",
    //     port: "8080",
    //     public: "0.0.0.0:8080",
    // },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.(hdr)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                limit: 8192,
                            },
                        },
                    ],
                },
            ],
        },
    },
};
