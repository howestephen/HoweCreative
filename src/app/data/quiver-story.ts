export const quiverProcess: Array<{
  title: string;
  body: string;
  image?: string;
  caption?: string;
}> = [
  {
    title: "Give the brief a visual language.",
    body:
      "The starting point was a logo, a product website and an early Grok-generated ident concept. I wrote the script and developed a consistent treatment for the film: a restrained monochrome world, directional light, material detail and space for the product story. The look had to remain coherent across generated imagery, typography and motion.",
    image: "/case-studies/quiver/archer-portrait.webp",
    caption: "The finished treatment: controlled light, a hidden face and room for the message.",
  },
  {
    title: "Plan the action the model can resolve.",
    body:
      "A convincing image does not guarantee convincing movement. The model could misread bowstring physics and invent an impossible transition. I planned the start and end moments to remove that ambiguity before generating footage. Choosing the shot, testing the source assets and deciding where the action begins and ends were central production decisions.",
    image: "/case-studies/quiver/process-impact-end.webp",
    caption: "A prepared impact endpoint gives the generated action a clear destination.",
  },
  {
    title: "Generate with a direction. Select with a purpose.",
    body:
      "I generated source images in ChatGPT and used Claude to drive ComfyUI for footage and audio. Image-led generation gave me a stronger starting point, but each shot still needed iteration, typically 5-10 attempts, followed by selection for usable movement and continuity. The music was also AI-generated through ComfyUI and shaped as part of the edit.",
    image: "/case-studies/quiver/process-eye-detail.webp",
    caption: "A prepared eye close-up, developed as a deliberate cutaway within the same visual world.",
  },
  {
    title: "Build the film so it can change.",
    body:
      "In After Effects I separated footage, generated mist and typography into depth layers, then controlled entrances, impacts, transitions and reading pace in the edit. AI-assisted scripts built the scene templates and reflowed the master sequence while preserving trims and ordering. That structure supported four finished versions across two scripts, with and without phone imagery.",
    image: "/case-studies/quiver/launch-rules.webp",
    caption: "Finished frame: generated footage, authored motion typography and supplied product imagery brought together in the edit.",
  },
];

export const quiverFilms: Array<{
  title: string;
  src: string;
  poster: string;
  duration: string;
  description: string;
}> = [
  {
    title: "Basic / with product",
    src: "/case-studies/quiver/basic-with-phone.mp4",
    poster: "/case-studies/quiver/basic-with-phone.poster.jpg",
    duration: "0:42",
    description: "The shorter explanation, with the supplied product interface presented on a phone.",
  },
  {
    title: "Advanced / with product",
    src: "/case-studies/quiver/advanced-with-phone.mp4",
    poster: "/case-studies/quiver/advanced-with-phone.poster.jpg",
    duration: "0:58",
    description: "The extended explanation, connecting the product interface to the film's visual narrative.",
  },
  {
    title: "Basic / film treatment",
    src: "/case-studies/quiver/basic.mp4",
    poster: "/case-studies/quiver/basic.poster.jpg",
    duration: "0:42",
    description: "The shorter explanation using the generated world and motion typography without phone imagery.",
  },
  {
    title: "Advanced / film treatment",
    src: "/case-studies/quiver/advanced.mp4",
    poster: "/case-studies/quiver/advanced.poster.jpg",
    duration: "0:58",
    description: "The extended explanation using the generated world and motion typography without phone imagery.",
  },
];
