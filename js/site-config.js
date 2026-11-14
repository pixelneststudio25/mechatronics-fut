/* ==========================================================================
   site-config.js  -  the one file to edit for navigation, contact details
   and social links. components.js builds the header, menu and footer from it.
   ========================================================================== */
window.SITE = {
  name: "Mechatronics Engineering",
  institution: "Federal University of Technology, Minna",
  tagline: "We think and create.",
  url: "https://mechatronics-fut.vercel.app",

  /* TODO: replace with the real department email and phone */
  email: "placeholder@example.com",
  phone: "", /* leave empty to hide */
  address: "Department of Mechatronics Engineering, Federal University of Technology, Minna, Niger State, Nigeria",

  /* Contact form (Web3Forms). Get a free access key at https://web3forms.com by entering the
     department email, then paste the key here. The key is meant to be public. */
  formKey: "59daa965-974c-4ee0-adb2-6abb1b843c73",

  /* Main pages. `home: true` hides the link from the desktop bar (the logo already goes home). */
  nav: [
    { label: "Home", href: "/", home: true },
    { label: "About", href: "/about.html" },
    { label: "Academics", href: "/academics.html" },
    { label: "People", href: "/people.html" },
    { label: "Projects", href: "/projects.html" },
    { label: "News and events", href: "/news-events.html" },
    { label: "Contact", href: "/contact.html" }
  ],

  /* Extra pages. Set `live: true` once the page exists. Links with live: false are not shown. */
  more: [
    { label: "Labs and facilities", href: "/labs.html", live: false },
    { label: "Resources", href: "/resources.html", live: false },
    { label: "Gallery", href: "/gallery.html", live: false },
    { label: "Partner with us", href: "/partner.html", live: false }
  ],

  /* Small legal links in the footer. Same rule: live: true once the page exists. */
  legal: [
    { label: "Privacy", href: "/privacy.html", live: false },
    { label: "Accessibility", href: "/accessibility.html", live: false }
  ],

  /* Icons available: facebook, x, linkedin, instagram */
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61582289944293", icon: "facebook" },
    { label: "X (Twitter)", href: "https://x.com/namtesfutminna", icon: "x" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/namtes-fut-minna-chapter/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/futmx.mce", icon: "instagram" }
  ],

  maintainedBy: "the department and NAMTES FUT Minna"
};
