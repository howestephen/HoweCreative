export const quiverFilm = {
  title: "Quiver launch film",
  src: "/case-studies/quiver/quiver-launch-film.mp4",
  poster: "/case-studies/quiver/hero-poster.jpg",
  duration: "1:08",
  format: "1920 x 1080 / 24 fps",
  description:
    "The finished launch film combines generated performances and atmospheres with authored typography, product storytelling and motion design.",
};

export const quiverEvidenceClips = [
  {
    title: "Bounded impact",
    src: "/case-studies/quiver/evidence-impact.mp4",
    poster: "/case-studies/quiver/evidence-impact.poster.jpg",
    description:
      "A generated transition between two deliberately matched states: an empty plate and the arrow at rest.",
  },
  {
    title: "Local character test",
    src: "/case-studies/quiver/evidence-archer.mp4",
    poster: "/case-studies/quiver/evidence-archer.poster.jpg",
    description:
      "A repeatable local inference pass developed from a composition designed around the model's limits.",
  },
  {
    title: "Independent atmosphere",
    src: "/case-studies/quiver/evidence-mist.mp4",
    poster: "/case-studies/quiver/evidence-mist.poster.jpg",
    description:
      "Mist generated as a separate layer so its timing, depth and intensity remained editable in After Effects.",
  },
];

export const quiverProcess = [
  {
    title: "Build a world from a sparse brief.",
    body:
      "The starting point was a logo, the existing product and a rough ident reference. I wrote the script and established a near-black world of empty hoods, cracked leather, hard overhead light, sparse smoke and controlled negative space. That direction gave image generation, typography, motion and sound one set of rules.",
  },
  {
    title: "Constrain the action before generating it.",
    body:
      "A convincing still does not guarantee believable motion. Bowstrings, hands and arrows expose the model quickly. For impact shots I designed pixel-matched start and end plates, then asked the model to resolve one bounded transition. For character shots I fixed the camera, silhouette, bow hand, arrow length and title-safe space before inference.",
  },
  {
    title: "Use local inference where iteration matters.",
    body:
      "I ran Wan 2.2 in ComfyUI on a dedicated RTX 4090 for repeatable image-to-video and first-to-last-frame passes. Hosted tools remained useful for fast exploration, while the local route gave me owned, credit-free iteration for prepared shots. The workflow was hybrid by design rather than tied to one generator.",
  },
  {
    title: "Keep the finishing layer deterministic.",
    body:
      "In After Effects I assembled a modular scene system with separate footage, mist, typography and product layers. AI-assisted scripts created scene comps, text precomps, impact markers, shared 2.5D depth and camera movement. The logo, type, arrow beats, edit rhythm and final assembly stayed authored and repeatable.",
  },
];
