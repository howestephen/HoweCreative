import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { QuiverCaseStudy } from "./QuiverCaseStudy";
import { quiverEvidenceClips, quiverFilm } from "../data/quiver-story";

vi.mock("../concept/ContactFoot", () => ({ ContactFoot: () => null }));

describe("Quiver case study", () => {
  it("leads with the final master and supports its process claims with inspectable evidence", () => {
    render(
      <MemoryRouter>
        <QuiverCaseStudy />
      </MemoryRouter>,
    );
    const master = screen.getByLabelText(quiverFilm.title);
    expect(master).toHaveAttribute("src", quiverFilm.src);
    expect(master).toHaveAttribute("controls");
    expect(master).not.toHaveAttribute("autoplay");
    expect(master).not.toHaveAttribute("muted");

    for (const clip of quiverEvidenceClips) {
      const evidence = screen.getByLabelText(clip.title);
      expect(evidence).toHaveAttribute("src", clip.src);
      expect(evidence).toHaveAttribute("controls");
      expect((evidence as HTMLVideoElement).muted).toBe(true);
      expect(evidence).not.toHaveAttribute("autoplay");
    }
    expect(
      screen.getByRole("heading", {
        name: "Failure is evidence when it changes the method.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wan 2.2 / ComfyUI / RTX 4090"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Read the film’s sequence"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/signed authorisations replace on-chain allowlists/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/buy gate can be disabled permanently/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^View larger:/ }),
    ).toHaveLength(11);
  });
});
