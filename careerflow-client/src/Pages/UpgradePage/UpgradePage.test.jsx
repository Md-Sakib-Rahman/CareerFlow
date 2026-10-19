import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UpgradePage from "./UpgradePage";

vi.mock("../../Axios/axiosInstance", () => ({ privateApi: { post: vi.fn() } }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

const renderPage = () => {
  const store = configureStore({
    reducer: { auth: (s = { user: { plan: "starter" } }) => s },
  });
  return render(
    <Provider store={store}>
      <UpgradePage />
    </Provider>
  );
};

describe("UpgradePage copy", () => {
  it("says Starter has up to 20 applications", () => {
    renderPage();
    expect(screen.getByText("Up to 20 Applications")).toBeInTheDocument();
    expect(screen.queryByText(/50 Applications/)).not.toBeInTheDocument();
  });

  it("does not show the removed claims, and keeps the others", () => {
    renderPage();
    expect(screen.queryByText(/AI Resume Matching/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Priority Support 24\/7/)).not.toBeInTheDocument();
    expect(screen.getByText("Export Reports to PDF")).toBeInTheDocument();
    expect(screen.getByText("Unlimited Applications")).toBeInTheDocument();
  });
});
