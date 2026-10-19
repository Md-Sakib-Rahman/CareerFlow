const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const boardRouter = require("../src/routes/boardRoutes");
const jobRouter = require("../src/routes/jobRoutes");

// Every route registered on the router, taken from its stack so new routes are covered automatically.
const routesOf = (router, prefix) =>
  router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) =>
      Object.keys(layer.route.methods).map((method) => ({
        method,
        url: prefix + layer.route.path.replace(/:\w+/g, new mongoose.Types.ObjectId().toString()),
      }))
    );

const routes = [...routesOf(boardRouter, "/api/boards"), ...routesOf(jobRouter, "/api/jobs")];

test("board and job routers expose both read and write routes", () => {
  const methods = new Set(routes.map((r) => r.method));
  expect(methods).toEqual(new Set(["get", "post", "patch", "delete"]));
});

test.each(routes.map((r) => [r.method.toUpperCase(), r.url]))(
  "%s %s -> 401 without a token",
  async (method, url) => {
    const res = await request(app)[method.toLowerCase()](url).send({});
    expect(res.status).toBe(401);
  }
);
