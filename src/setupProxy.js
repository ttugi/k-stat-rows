const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    "/stat",
    createProxyMiddleware({
      target: "https://stat.kita.net",
      changeOrigin: true,
    })
  );
};