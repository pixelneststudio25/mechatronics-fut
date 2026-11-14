/* ==========================================================================
   gallery.js  -  the photo list. Edit this file, not the page.
   To add a photo: put the (compressed, WebP) file in /images/gallery/ or any
   images folder, then add one block below.
   Fields:
     src       path to the image
     w, h      the image's width and height in pixels (keeps the layout steady)
     alt       what the photo shows (for screen readers)
     caption   short text shown on the photo and in the viewer ("" for none)
     category  "events" or "projects" (add new names to CATEGORIES below)
   Newest first is a good order.
   ========================================================================== */
window.GALLERY_CATEGORIES = { events: "Events", projects: "Projects" };

window.GALLERY = [
  { src: "/images/events/namtes-executives-2025-26.webp", w: 720, h: 1080, category: "events",
    alt: "Poster introducing the 2025/2026 NAMTES executives", caption: "Meet the 2025/2026 NAMTES executives" },
  { src: "/images/events/award-group.webp", w: 1080, h: 810, category: "events",
    alt: "Three people wearing medals, standing outdoors on campus", caption: "" },
  { src: "/images/events/award-handshake.webp", w: 810, h: 1080, category: "events",
    alt: "Two people wearing medals shaking hands", caption: "" },
  { src: "/images/events/award-trophy-red.webp", w: 810, h: 1080, category: "events",
    alt: "A smiling person in a red outfit holding a trophy", caption: "" },
  { src: "/images/events/award-trophy-black-cap.webp", w: 810, h: 1080, category: "events",
    alt: "A person in a black cap holding a trophy", caption: "" },

  { src: "/images/projects/waste-disposal-robot.webp", w: 900, h: 1200, category: "projects",
    alt: "A four-wheeled student-built waste disposal robot with a yellow container", caption: "Waste disposal robot" },
  { src: "/images/projects/solar-water-pump-rig.webp", w: 809, h: 1080, category: "projects",
    alt: "Test rig for the solar-powered water pump control system", caption: "Solar water pump rig" },
  { src: "/images/projects/solar-panel.webp", w: 810, h: 1080, category: "projects",
    alt: "A solar panel used in a student project", caption: "Solar panel project" }
];
