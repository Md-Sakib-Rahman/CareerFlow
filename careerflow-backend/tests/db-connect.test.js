const mongoose = require("mongoose");

jest.unmock("../src/config/db"); // setup.js mocks it globally; this file tests the real module
const dbConnect = require("../src/config/db");

afterEach(() => {
  delete mongoose.connection.readyState;
  jest.restoreAllMocks();
});

test("dbConnect() when already connected does not call mongoose.connect", async () => {
  const connectSpy = jest.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
  jest.spyOn(console, "log").mockImplementation(() => {});
  Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

  await dbConnect();
  await dbConnect();

  expect(connectSpy).not.toHaveBeenCalled();
});
