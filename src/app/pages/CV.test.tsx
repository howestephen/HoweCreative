import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { CV } from "./CV";

describe("CV targeting", () => {
  it("switches the focus and matching PDF without changing the employment history", () => {
    render(
      <MemoryRouter>
        <CV />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "/cv/Stephen-Howe-Creative-Technologist.pdf",
    );
    fireEvent.change(screen.getByRole("combobox", { name: "CV focus" }), {
      target: { value: "design-engineer" },
    });
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "/cv/Stephen-Howe-Design-Engineer.pdf",
    );
    expect(
      screen.getByRole("heading", { name: /Lead Designer \| UNCX/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Design Engineer \| UNCX/ }),
    ).not.toBeInTheDocument();
  });
  it("uses a safe default for an unknown focus", () => {
    render(
      <MemoryRouter initialEntries={["/cv?focus=constructor"]}>
        <CV />
      </MemoryRouter>,
    );
    expect(screen.getByRole("combobox", { name: "CV focus" })).toHaveValue(
      "creative-technologist",
    );
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "/cv/Stephen-Howe-Creative-Technologist.pdf",
    );
  });
});
