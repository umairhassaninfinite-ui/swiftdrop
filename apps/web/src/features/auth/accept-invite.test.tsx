import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AcceptInvite } from "./accept-invite.js";
import { acceptInvitation } from "./client.js";

vi.mock("./client.js", () => ({
  acceptInvitation: vi.fn(),
  errorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Request failed.",
}));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(
    null,
    "",
    `/auth/accept-invite#token=${"A".repeat(43)}`,
  );
});

function page() {
  return render(
    <MemoryRouter>
      <AcceptInvite />
    </MemoryRouter>,
  );
}

describe("accept staff invitation", () => {
  it("removes the token fragment and validates matching strong passwords", async () => {
    page();
    expect(window.location.hash).toBe("");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Password"), "short");
    await user.type(screen.getByLabelText("Confirm password"), "short");
    await user.click(screen.getByRole("button", { name: "Set password" }));
    expect(
      await screen.findByText("Use at least 15 characters."),
    ).toBeInTheDocument();
    expect(acceptInvitation).not.toHaveBeenCalled();
  });

  it("submits once, clears password fields, and sends the recipient to login", async () => {
    vi.mocked(acceptInvitation).mockResolvedValue({
      message: "Your account is ready.",
    });
    page();
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText("Password"),
      "A unique staff passphrase!",
    );
    await user.type(
      screen.getByLabelText("Confirm password"),
      "A unique staff passphrase!",
    );
    await user.click(screen.getByRole("button", { name: "Set password" }));
    expect(
      await screen.findByText("Your account is ready."),
    ).toBeInTheDocument();
    expect(acceptInvitation).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/auth/login",
    );
  });
});
