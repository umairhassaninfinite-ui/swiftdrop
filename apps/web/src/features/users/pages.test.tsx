import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AdminUsers, NewStaff } from "./pages.js";
import { createStaff, listStaff, updateInvitation } from "../auth/client.js";

const invited = {
  id: 4,
  fullName: "Dispatch Staff",
  email: "dispatch@example.test",
  phone: "+94771234567",
  role: "DISPATCHER" as const,
  status: "INVITED" as const,
  createdAt: "2026-10-30T00:00:00.000Z",
  invitationExpiresAt: "2026-10-31T00:00:00.000Z",
};

vi.mock("../auth/client.js", () => ({
  createStaff: vi.fn(),
  listStaff: vi.fn(),
  updateInvitation: vi.fn(),
  errorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Request failed.",
}));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.mocked(listStaff).mockResolvedValue({
    items: [invited],
    nextCursor: null,
  });
});

function page() {
  return render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>,
  );
}

describe("admin staff users", () => {
  it("shows invitation state and refreshes after resend", async () => {
    vi.mocked(updateInvitation).mockResolvedValue({
      user: invited,
      delivery: "failed",
    });
    page();
    expect(await screen.findByText("Dispatch Staff")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Resend" }));
    expect(await screen.findByText(/could not be sent/)).toBeInTheDocument();
    expect(updateInvitation).toHaveBeenCalledWith(4, "resend");
  });

  it("offers an empty state and recovers from list failure", async () => {
    vi.mocked(listStaff).mockRejectedValue(
      new Error("Cannot reach SwiftDrop."),
    );
    page();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot reach SwiftDrop.",
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(listStaff).toHaveBeenCalledTimes(2);
  });

  it("links create validation to fields and focuses the first error", async () => {
    render(
      <MemoryRouter>
        <NewStaff />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Create invitation" }));
    expect(screen.getByLabelText("Full name")).toHaveFocus();
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(createStaff).not.toHaveBeenCalled();
  });
});
