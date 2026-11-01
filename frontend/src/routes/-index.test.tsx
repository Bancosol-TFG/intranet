import { render, screen } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { clearSession, startSession } from "../shared/api/session";
import { router } from "../router";

describe("ruta inicial", () => {
  afterEach(clearSession);

  it("muestra el encabezado de la intranet", async () => {
    startSession({
      accessToken: "token",
      expiresIn: 900,
      user: {
        id: 1,
        email: "a@b.es",
        firstName: "A",
        surname: null,
        roles: [],
        permissions: [],
        mustChangePassword: false,
      },
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Intranet" })).toBeInTheDocument();
  });
});
