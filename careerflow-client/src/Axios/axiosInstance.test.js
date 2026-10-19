import { describe, it, expect, beforeEach, vi } from "vitest";
import { AxiosError } from "axios";
import * as api from "./axiosInstance";

const { publicApi, privateApi } = api;

const fail = (config, status, data = {}) =>
  Promise.reject(
    new AxiosError(`status ${status}`, "ERR_BAD_REQUEST", config, null, {
      status,
      data,
      headers: {},
      config,
    }),
  );
const ok = (config, data = {}) =>
  Promise.resolve({ status: 200, data, headers: {}, config, statusText: "OK" });
const bearer = (config) => config.headers.Authorization;

let privateCalls;
let refreshCalls;
let handlers;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("accessToken", "old");
  privateCalls = [];
  refreshCalls = 0;
  handlers = { onTokenRefreshed: vi.fn(), onSessionExpired: vi.fn() };
  api.setAuthHandlers?.(handlers);

  // private API: only the "new" token is accepted on /jobs
  privateApi.defaults.adapter = (config) => {
    privateCalls.push({ url: config.url, auth: bearer(config) });
    if (config.url === "/jobs" && bearer(config) === "Bearer new") {
      return ok(config, { jobs: [] });
    }
    if (config.url === "/boom") return fail(config, 500);
    return fail(config, 401);
  };
  // public API: refresh succeeds by default
  publicApi.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh-token") {
      refreshCalls += 1;
      await new Promise((r) => setTimeout(r, 10));
      return ok(config, { success: true, accessToken: "new" });
    }
    return fail(config, 404);
  };
});

describe("privateApi 401 refresh interceptor", () => {
  it("retries the original request with the new token after a successful refresh", async () => {
    const res = await privateApi.get("/jobs");
    expect(res.status).toBe(200);
    expect(refreshCalls).toBe(1);
    expect(privateCalls.at(-1).auth).toBe("Bearer new");
    expect(localStorage.getItem("accessToken")).toBe("new");
    expect(handlers.onTokenRefreshed).toHaveBeenCalledWith("new");
  });

  it("shares ONE refresh call between three parallel 401s", async () => {
    const results = await Promise.all([
      privateApi.get("/jobs"),
      privateApi.get("/jobs"),
      privateApi.get("/jobs"),
    ]);
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(refreshCalls).toBe(1);
  });

  it("clears the session and rejects when the refresh fails", async () => {
    publicApi.defaults.adapter = (config) => {
      if (config.url === "/auth/refresh-token") refreshCalls += 1;
      return fail(config, 401);
    };
    await expect(privateApi.get("/jobs")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshCalls).toBe(1);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(handlers.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("does not loop when the retried request is 401 again", async () => {
    // refresh "succeeds" but the new token is still rejected by the API
    publicApi.defaults.adapter = async (config) => {
      refreshCalls += 1;
      return ok(config, { accessToken: "still-bad" });
    };
    await expect(privateApi.get("/jobs")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshCalls).toBe(1);
    expect(privateCalls).toHaveLength(2); // original + one retry
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(handlers.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("does not try to refresh for a 401 on /auth/login", async () => {
    await expect(privateApi.post("/auth/login", {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshCalls).toBe(0);
    expect(privateCalls).toHaveLength(1);
  });

  it("passes non-401 errors through untouched", async () => {
    await expect(privateApi.get("/boom")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(refreshCalls).toBe(0);
    expect(privateCalls).toHaveLength(1);
    expect(localStorage.getItem("accessToken")).toBe("old");
    expect(handlers.onSessionExpired).not.toHaveBeenCalled();
  });
});
