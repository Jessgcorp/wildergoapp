const { getDefaultConfig } = require("expo/metro-config");
const { createProxyMiddleware } = require("http-proxy-middleware");

const config = getDefaultConfig(__dirname);

/** Single proxy instance — avoids creating a new middleware per request (memory / flaky tunnels). */
const apiProxy = createProxyMiddleware({
  target: "http://127.0.0.1:5000",
  changeOrigin: true,
  proxyTimeout: 12_000,
  timeout: 12_000,
  on: {
    error(_err, req, res) {
      if (res && typeof res.writeHead === "function" && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error:
              "API proxy: nothing listening on http://127.0.0.1:5000. Start the server (e.g. npm run server:dev) or use extra.apiBaseUrl.",
          }),
        );
      }
    },
  },
});

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith("/api/")) {
        return apiProxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
