import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { Archive } from "./Archive";

afterEach(() => {
  document.title = "";
});

describe("work archive", () => {
  it("lists every public project as a collapsed row that opens on demand", () => {
    const { container } = render(<MemoryRouter><Archive /></MemoryRouter>);

    const rows = container.querySelectorAll(".archive-section .archive-era");
    expect(rows).toHaveLength(9);
    // Closed by default: the archive is an index, not nine expanded cases.
    expect([...rows].every((row) => !row.hasAttribute("open"))).toBe(true);

    const quiver = [...rows].find((row) => within(row as HTMLElement).queryByText("Quiver"))!;
    expect(quiver).toBeDefined();
    expect(within(quiver as HTMLElement).getByRole("link", { name: /Read the full case study/ }))
      .toHaveAttribute("href", "/work/quiver");
  });

  it("offers no discipline or software filter, because selected work already groups by discipline", () => {
    render(<MemoryRouter><Archive /></MemoryRouter>);

    expect(screen.queryByRole("group", { name: "Disciplines" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by software or platform")).not.toBeInTheDocument();
  });

  it("keeps restricted V7 work out of the public archive", () => {
    const { container } = render(<MemoryRouter><Archive /></MemoryRouter>);

    const titles = [...container.querySelectorAll(".archive-era summary strong")].map((node) => node.textContent);
    expect(titles).not.toContain("UNCX App Prototyping");
    expect(screen.getByRole("heading", { name: "Complex prototypes can be shared in an employer review." })).toBeInTheDocument();
  });
});
