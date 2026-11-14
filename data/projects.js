/* ==========================================================================
   projects.js  -  the project list. Edit this file, not the page.
   Fields:
     title, kind ("student" or "research"), tags (short list),
     students   (names, or "" to hide the line)
     supervisor (names, or "" to hide the line)
     funder     (name, or "" if not funded)
     abstract   (1 to 3 sentences)
     image      (path under /images/projects/, or "" to show the plain tile)
     alt        (describes the photo; only needed when image is set)
   ========================================================================== */
window.PROJECTS = [
  {
    title: "Accident Detection System with Vehicle-to-Infrastructure Communication",
    kind: "student",
    tags: ["IoT", "Road safety", "Sensors"],
    students: "Yusuf Abdullahi Olamilekan",
    supervisor: "Dr. T. A. Folorunso and Dr. J. A. Bala",
    funder: "",
    abstract: "An integrated system for accident prevention through road anomaly detection, hazard communication and real-time driver alerts. It uses IR, vibration, flame and GPS sensors, with a CYD display unit connected over Wi-Fi for real-time hazard communication.",
    image: "",
    alt: ""
  },
  {
    title: "Autonomous Hospital Waste Disposal System",
    kind: "student",
    tags: ["Robotics", "Automation"],
    students: "Student team",
    supervisor: "Dr. J. A. Bala",
    funder: "",
    abstract: "A waste disposal robot and smart bins system. The robot autonomously empties the bins by prioritising air pollution levels and waste quantity, for efficient and hygienic hospital waste management.",
    image: "/images/projects/waste-disposal-robot.webp",
    alt: "Student-built autonomous hospital waste disposal robot"
  },
  {
    title: "Solar-Powered Flexible Water Pump Control System",
    kind: "student",
    tags: ["Solar energy", "Control"],
    students: "Student team",
    supervisor: "Dr. T. A. Folorunso",
    funder: "",
    abstract: "A solar panel-enabled flexible control mechanism for submersible water pumps in domestic applications. It combines automation and solar energy to keep water available, lower running costs and support areas with unstable electricity.",
    image: "/images/projects/solar-water-pump-rig.webp",
    alt: "Test rig for the solar-powered water pump control system"
  },
  {
    title: "AI-Based Autonomous Robotic System for Weed Control in Maize Farmland",
    kind: "research",
    tags: ["AI", "Robotics", "Agriculture"],
    students: "", supervisor: "",
    funder: "TETFund",
    abstract: "An autonomous robot that uses artificial intelligence to identify and remove weeds in maize fields, reducing herbicide use and increasing crop yield.",
    image: "", alt: ""
  },
  {
    title: "Novel Road Accident Monitoring and Prevention System",
    kind: "research",
    tags: ["Road safety", "Sensors"],
    students: "", supervisor: "",
    funder: "TETFund",
    abstract: "A monitoring system for Nigerian roads and highways that detects accident-prone conditions and alerts drivers in real time, aiming to reduce fatalities.",
    image: "", alt: ""
  },
  {
    title: "Novel Pipeline Monitoring under High Temperature and Pressure Conditions",
    kind: "research",
    tags: ["Sensors", "Safety"],
    students: "", supervisor: "",
    funder: "TETFund",
    abstract: "Sensors and monitoring systems for pipelines operating under extreme conditions, for safety and early leak detection.",
    image: "", alt: ""
  },
  {
    title: "Artificial Intelligence for Clean Energy",
    kind: "research",
    tags: ["AI", "Clean energy"],
    students: "", supervisor: "",
    funder: "Royal Academy of Engineering",
    abstract: "Using AI to optimise clean energy generation, storage and distribution, with a focus on improving efficiency and integrating renewable sources.",
    image: "", alt: ""
  },
  {
    title: "Intelligent Wireless Mobile Phone Charger",
    kind: "research",
    tags: ["Electronics", "Embedded"],
    students: "", supervisor: "",
    funder: "Nigerian Communications Commission (NCC)",
    abstract: "Fabrication of an intelligent wireless charger that optimises charging efficiency, detects device compatibility and includes safety features.",
    image: "", alt: ""
  },
  {
    title: "STEM e-Literacy Platform for Secondary Education",
    kind: "research",
    tags: ["Education", "Software"],
    students: "", supervisor: "",
    funder: "Kaduna State Government",
    abstract: "A digital platform to improve STEM literacy among secondary school students in Kaduna State, with interactive e-learning resources and teacher support.",
    image: "", alt: ""
  }
];
