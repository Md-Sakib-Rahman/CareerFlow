import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router";
import NotificationBell from "./NotificationBell";

vi.mock("../../Redux/reminder/reminderSlice", () => ({
  fetchReminders: () => ({ type: "test/fetchReminders" }),
  dismissReminderAction: (id) => ({ type: "test/dismiss", payload: id }),
}));

const renderBell = (notifications) => {
  const store = configureStore({
    reducer: {
      auth: (s = { user: { plan: "pro" } }) => s,
      reminder: (s = { notifications, loading: false }) => s,
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </Provider>
  );
};

describe("NotificationBell text", () => {
  it("shows the apply heading, job title, company and a formatted date", () => {
    renderBell([
      {
        _id: "1",
        type: "apply",
        targetDate: "2026-11-05T12:00:00.000Z",
        jobId: { company: "Acme", title: "Frontend Dev", status: "wishlist" },
      },
    ]);
    expect(screen.getByText("Apply deadline")).toBeInTheDocument();
    expect(screen.getByText(/Frontend Dev at Acme/)).toBeInTheDocument();
    expect(screen.getByText(/Nov 5, 2026/)).toBeInTheDocument();
  });

  it("does not crash and shows a fallback when jobId is null", () => {
    renderBell([
      { _id: "2", type: "interview", targetDate: "2026-11-05T12:00:00.000Z", jobId: null },
    ]);
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText(/Job no longer available/)).toBeInTheDocument();
  });
});
