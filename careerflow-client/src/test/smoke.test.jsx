import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() {
  return <h1>Hello CareerFlow</h1>;
}

describe("test harness", () => {
  it("renders a trivial component", () => {
    render(<Hello />);
    expect(screen.getByText("Hello CareerFlow")).toBeInTheDocument();
  });
});
