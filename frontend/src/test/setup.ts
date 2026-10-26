import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.stubEnv("VITE_BACKEND_URL", "/api");

Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });

afterEach(() => {
  cleanup();
});
