const request = require("supertest");

const loadApp = (env = {}) => {
  let app;
  const saved = { ...process.env };
  Object.assign(process.env, env);
  if (!("CORS_ORIGINS" in env)) delete process.env.CORS_ORIGINS;
  jest.isolateModules(() => {
    app = require("../src/app");
  });
  process.env = saved;
  return app;
};

const acao = (app, origin) => request(app).get("/").set("Origin", origin).then((r) => r.headers["access-control-allow-origin"]);

test("S20: unknown origin gets no CORS headers even with NODE_ENV=development", async () => {
  const app = loadApp({ NODE_ENV: "development" });
  expect(await acao(app, "https://evil.example")).toBeUndefined();
});

test("S20: built-in allowlist origins are allowed", async () => {
  const app = loadApp();
  for (const o of ["http://localhost:5173", "http://127.0.0.1:5173", "https://career-flow-six.vercel.app"]) {
    expect(await acao(app, o)).toBe(o);
  }
});

test("S20: origins from CORS_ORIGINS are allowed, others still are not", async () => {
  const app = loadApp({ CORS_ORIGINS: " https://a.example , https://b.example ,," });
  expect(await acao(app, "https://a.example")).toBe("https://a.example");
  expect(await acao(app, "https://b.example")).toBe("https://b.example");
  expect(await acao(app, "https://c.example")).toBeUndefined();
});
