const request = require("supertest");
const app = require("../src/app");

test("GET / responds with the welcome payload", async () => {
  const res = await request(app).get("/");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("success");
});
