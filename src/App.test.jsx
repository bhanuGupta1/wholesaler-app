import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it("contains main app structure", () => {
    render(<App />);
    // Add specific tests based on your App component structure
    // Example: expect(screen.getByText('Wholesaler App')).toBeInTheDocument();
  });
});
