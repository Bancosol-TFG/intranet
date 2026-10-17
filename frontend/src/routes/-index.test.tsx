import { render, screen } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { router } from "../router";

describe("ruta inicial", () => {
  it("muestra el encabezado de la intranet", async () => {
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Intranet" })).toBeInTheDocument();
  });
});
