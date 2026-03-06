import { render, screen } from "@testing-library/react";

import { App } from "../App.js";

describe("App", () => {
  it("renders the scaffold headline", () => {
    render(<App />);

    expect(screen.getByText(/TPS 2.0 monorepo scaffold/i)).toBeInTheDocument();
  });
});

