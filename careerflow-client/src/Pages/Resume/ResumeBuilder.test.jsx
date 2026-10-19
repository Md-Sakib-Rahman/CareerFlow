import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router";
import ResumeBuilder from "./ResumeBuilder";

vi.mock("../../Redux/board/boardSlice", () => ({
  fetchAllUserJobs: () => ({ type: "test/fetchAllUserJobs" }),
}));

const makeResumes = (n, name = (i) => `cv${i}.pdf`) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `r${i}`,
    name: name(i),
    type: "General",
    fileUrl: `https://files.test/resumes/r${i}`,
    uploadedAt: new Date().toISOString(),
  }));

const mockFetch = (resumes) => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(resumes) })
  );
};

const renderVault = (plan) => {
  const store = configureStore({
    reducer: {
      auth: (s = { user: { plan }, accessToken: "t" }) => s,
      board: (s = { allJobs: [] }) => s,
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ResumeBuilder />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  localStorage.clear();
});

describe("Resume Vault limits", () => {
  it("shows 30 for pro", async () => {
    mockFetch(makeResumes(2));
    renderVault("pro");
    expect(await screen.findByText(/2 \/ 30 Used/)).toBeInTheDocument();
  });

  it("shows 100 for executive", async () => {
    mockFetch(makeResumes(2));
    renderVault("executive");
    expect(await screen.findByText(/2 \/ 100 Used/)).toBeInTheDocument();
  });

  it("over the limit: upload disabled, list, download and delete still available", async () => {
    mockFetch(makeResumes(31));
    renderVault("pro");
    const upload = await screen.findByRole("button", { name: /Vault Full/ });
    expect(upload).toBeDisabled();
    expect(screen.getByText(/Showing 31 Resumes/)).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((b) => !b.disabled).length).toBeGreaterThan(31);
  });
});

describe("Resume Vault starter", () => {
  it("shows a spinner, not the lock page, while loading", () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));
    renderVault("starter");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText(/Resume Vault is a Pro Feature/)).not.toBeInTheDocument();
  });

  it("shows the lock page once the list has loaded empty", async () => {
    mockFetch([]);
    renderVault("starter");
    expect(await screen.findByText(/Resume Vault is a Pro Feature/)).toBeInTheDocument();
  });

  it("with leftover resumes shows the vault with upload disabled", async () => {
    mockFetch(makeResumes(2));
    renderVault("starter");
    expect(await screen.findByText(/Showing 2 Resumes/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Vault Full/ })).toBeDisabled();
    expect(screen.queryByText(/Resume Vault is a Pro Feature/)).not.toBeInTheDocument();
  });
});

describe("Resume Vault files", () => {
  it("accepts PDF, DOC and DOCX in the file input", async () => {
    mockFetch(makeResumes(1));
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByRole("button", { name: /Upload New/ }));
    const accept = container.querySelector('input[type="file"]').getAttribute("accept");
    for (const t of [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".pdf",
      ".doc",
      ".docx",
    ]) {
      expect(accept).toContain(t);
    }
  });

  it("offers download only (no inline preview iframe) for a Word file", async () => {
    mockFetch(makeResumes(1, () => "cv.docx"));
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("cv.docx"));
    expect(await screen.findByText(/Preview isn't available for Word files/)).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("still previews a PDF in the iframe", async () => {
    mockFetch(makeResumes(1));
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("cv0.pdf"));
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
  });

  it("renders no Word message or Download button when the previewed resume is gone", async () => {
    // fileUrl does not contain the id, as with real Cloudinary URLs
    const resumes = [{ ...makeResumes(1, () => "cv.docx")[0], fileUrl: "https://files.test/abc" }];
    mockFetch(resumes);
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("cv.docx"));
    expect(await screen.findByText(/Preview isn't available for Word files/)).toBeInTheDocument();

    const row = screen.getByText("cv.docx").closest(".group");
    fireEvent.click(within(row).getAllByRole("button")[2]);
    // simulate the resume vanishing from the list while the preview URL is still set
    mockFetch([]);
    fireEvent.click(screen.getByRole("button", { name: /Yes, Delete/ }));
    await waitFor(() => expect(screen.queryByText("cv.docx")).toBeNull());

    expect(screen.queryByText(/Preview isn't available for Word files/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });
});

describe("Resume Vault delete and preview", () => {
  // fileUrl does not contain the id, as with real Cloudinary URLs
  const twoResumes = () => [
    { ...makeResumes(1, () => "a.pdf")[0], _id: "r0", fileUrl: "https://files.test/aaa" },
    { ...makeResumes(1, () => "b.docx")[0], _id: "r1", fileUrl: "https://files.test/bbb" },
  ];
  const deleteResume = async (name) => {
    const row = screen.getByText(name).closest(".group");
    fireEvent.click(within(row).getAllByRole("button")[2]);
    fireEvent.click(screen.getByRole("button", { name: /Yes, Delete/ }));
    await waitFor(() => expect(screen.queryByText(name)).toBeNull());
  };

  it("empties the viewer pane when the previewed resume is deleted", async () => {
    mockFetch(twoResumes());
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("a.pdf"));
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    await deleteResume("a.pdf");
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.queryByText(/Preview isn't available for Word files/)).toBeNull();
    expect(screen.getByText(/Select a resume from the list to preview/)).toBeInTheDocument();
  });

  it("empties the viewer pane when a previewed Word resume is deleted", async () => {
    mockFetch(twoResumes());
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("b.docx"));
    expect(await screen.findByText(/Preview isn't available for Word files/)).toBeInTheDocument();
    await deleteResume("b.docx");
    expect(screen.queryByText(/Preview isn't available for Word files/)).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("keeps the preview when a different resume is deleted", async () => {
    mockFetch(twoResumes());
    const { container } = renderVault("pro");
    fireEvent.click(await screen.findByText("a.pdf"));
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    await deleteResume("b.docx");
    expect(container.querySelector("iframe")).not.toBeNull();
  });
});

