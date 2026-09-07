import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { QuiverCaseStudy } from "./QuiverCaseStudy";
import { quiverFilms } from "../data/quiver-story";

vi.mock("../concept/ContactFoot", () => ({ ContactFoot: () => null }));

describe("Quiver film screening", () => {
  it("replaces the player when a different edit is selected and leaves playback to the viewer", () => {
    render(
      <MemoryRouter>
        <QuiverCaseStudy />
      </MemoryRouter>,
    );
    const firstPlayer = screen.getByLabelText("Quiver: Basic / with product");
    expect(firstPlayer).toHaveAttribute("controls");
    expect(firstPlayer).not.toHaveAttribute("autoplay");
    expect(firstPlayer).not.toHaveAttribute("muted");

    for (const film of quiverFilms) {
      expect(
        screen.getByRole("link", {
          name: (name) => name.includes(film.title),
        }),
      ).toHaveAttribute("href", film.src);
    }

    fireEvent.click(
      screen.getByRole("link", { name: /Advanced \/ film treatment/ }),
    );

    expect(firstPlayer).not.toBeInTheDocument();
    const selectedPlayer = screen.getByLabelText(
      "Quiver: Advanced / film treatment",
    );
    expect(selectedPlayer).toHaveAttribute(
      "src",
      "/case-studies/quiver/advanced.mp4",
    );
    expect(selectedPlayer).not.toHaveAttribute("autoplay");
    expect(
      screen.getByRole("link", { name: /Advanced \/ film treatment/ }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("link", { name: /Basic \/ with product/ }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getAllByRole("button", { name: /^View larger:/ }),
    ).toHaveLength(11);
  });
});
