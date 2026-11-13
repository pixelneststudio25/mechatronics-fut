/* ==========================================================================
   courses.js  -  the curriculum data. Edit this file, not the page.

   HOW TO ADD COURSES
   Put each course object inside the right semester's `courses` list:
     { code: "MEE 211", title: "Course title", units: 3, type: "Core" }
   `type` is "Core" or "Elective". Units are numbers.

   LINKS (per level)
   materials:      a Google Drive folder link (use "Anyone with the link can view")
   pastQuestions:  a link to the past questions for that level
   Leave "" while there is nothing yet and the buttons show "coming soon".

   VERIFICATION
   Once the course list has been checked against the official FUT Minna
   curriculum, set `verified` to a date like "2026-12-01" and (optionally)
   put the link to the official outline in `officialLink`.
   While `verified` is null the page shows "Pending official curriculum".
   ========================================================================== */
window.CURRICULUM = {
  verified: null,
  officialLink: "",
  levels: [
    { level: 100, year: 1, materials: "", pastQuestions: "", semesters: [ { name: "First semester", courses: [] }, { name: "Second semester", courses: [] } ] },
    { level: 200, year: 2, materials: "", pastQuestions: "", semesters: [ { name: "First semester", courses: [] }, { name: "Second semester", courses: [] } ] },
    { level: 300, year: 3, materials: "", pastQuestions: "", semesters: [ { name: "First semester", courses: [] }, { name: "Second semester", courses: [] } ] },
    { level: 400, year: 4, materials: "", pastQuestions: "", semesters: [ { name: "First semester", courses: [] }, { name: "Second semester", courses: [] } ] },
    { level: 500, year: 5, materials: "", pastQuestions: "", semesters: [ { name: "First semester", courses: [] }, { name: "Second semester", courses: [] } ] }
  ]
};
