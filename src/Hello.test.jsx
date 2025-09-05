import { render, screen } from "@testing-library/react";
import Hello from "./Hello";

test("renders greeting", () => {
  render(<Hello name="React" />);
  expect(screen.getByRole("heading", { name: /hello, react!/i })).toBeInTheDocument();
});
