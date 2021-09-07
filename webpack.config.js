require("dotenv").config();
const path = require("path");
const { DefinePlugin } = require("webpack");
const WebpackUserscript = require("webpack-userscript");

module.exports = () => {
  const dev = process.env.NODE_ENV === "development";
  const cloudmusicApiDomain = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/.exec(
    process.env.CLOUDMUSIC_API
  )[1];

  return {
    mode: dev ? "development" : "production",
    entry: path.resolve(__dirname, "src", "index.ts"),
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "ytml.user.js",
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
    },
    plugins: [
      new DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
      new WebpackUserscript({
        headers: {
          name: "Youtube Music Lyrics",
          match: ["https://music.youtube.com/*"],
          connect: [cloudmusicApiDomain, "apic-desktop.musixmatch.com", "translate.googleapis.com"],
          noframes: true,
          grant: ["GM_xmlhttpRequest", "GM_getValue", "GM_setValue"],
          version: dev ? `[version]-build.[buildNo]` : `[version]`,
        },
        ssri: true,
      }),
    ],
  };
};
