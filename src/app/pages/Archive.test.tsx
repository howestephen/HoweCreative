import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { Archive } from "./Archive";

afterEach(() => {
  document.title = "";
});

describe("work archive", () => {
  it("filters the public projects by discipline and software", () => {
    render(<MemoryRouter><Archive /></MemoryRouter>);

    expect(screen.getByText("9 projects")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("group", { name: "Disciplines" })).getByRole("button", { name: "Film and motion" }));
    expect(screen.getByText("3 projects")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quiver" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Badger Club App" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter by software or platform"), {
      target: { value: "Cinema 4D" },
    });
    expect(screen.getByText("2 projects")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "UNCX Video & 3D System" })).toBeInTheDocument();
  });

  it("keeps restricted V7 work out of the public project grid", () => {
    render(<MemoryRouter><Archive /></MemoryRouter>);

    expect(screen.queryByRole("heading", { name: "UNCX App Prototyping" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complex prototypes can be shared in an employer review." })).toBeInTheDocument();
  });
});
