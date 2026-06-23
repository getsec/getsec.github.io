export const siteConfig = {
  name: "Nathan Getty",
  title: "Security Engineer",
  description: "Portfolio website of Nathan Getty",
  // Change this hex to recolor the whole site (hero, accents, hover states).
  accentColor: "#2563eb",
  social: {
    email: "nathan.getty@menlosecurity.com",
    // EDIT or remove: the footer renders this link unconditionally.
    linkedin: "https://linkedin.com/in/nathan-getty",
    // EDIT or remove: the footer renders this link unconditionally.
    twitter: "https://x.com/yourhandle",
    github: "https://github.com/getsec",
  },
  // EDIT: your bio.
  aboutMe:
    "Security engineer focused on detection engineering, incident response, and offensive testing. I turn noisy telemetry into high-signal detections, automate analyst toil, and break things on purpose to understand how they fail.",
  // EDIT: your skills.
  skills: [
    "Detection Engineering",
    "Incident Response",
    "Threat Hunting",
    "Python",
    "SIEM",
    "EDR",
    "Linux",
    "AWS",
  ],
  // EDIT: your projects. Remove the array (or empty it) to hide the section.
  projects: [
    {
      name: "Detection Pipeline Toolkit",
      description:
        "Tools for normalizing telemetry and shipping high-signal detections with low analyst toil.",
      link: "https://github.com/getsec",
      skills: ["Python", "SIEM", "Detection"],
    },
    {
      name: "CTF Write-ups",
      description:
        "Solutions and notes from CTF challenges across web, pwn, and reversing.",
      link: "https://github.com/getsec",
      skills: ["Reversing", "Web", "Pwn"],
    },
    {
      name: "Adversary Emulation Lab",
      description:
        "A repeatable lab for emulating attacker TTPs and validating detections end to end.",
      link: "https://github.com/getsec",
      skills: ["Red Team", "Atomic", "Lab"],
    },
  ],
  // EDIT: your work history. Remove the array (or empty it) to hide the section.
  experience: [
    {
      company: "Menlo Security",
      title: "Security Engineer",
      dateRange: "2023 - Present",
      bullets: [
        "Built and tuned detections that cut false positives and analyst toil.",
        "Led incident response for high-severity alerts end to end.",
        "Automated SOC triage workflows, reducing mean time to respond.",
      ],
    },
    {
      company: "Previous Company",
      title: "Security Analyst",
      dateRange: "2021 - 2023",
      bullets: [
        "Triaged and investigated alerts across endpoint and network telemetry.",
        "Authored runbooks and expanded detection coverage.",
        "Partnered with engineering to remediate recurring root causes.",
      ],
    },
  ],
  // EDIT: your education. Remove the array (or empty it) to hide the section.
  education: [
    {
      school: "Your University",
      degree: "B.S. in Computer Science",
      dateRange: "2017 - 2021",
      achievements: [
        "EDIT: relevant honors or coursework",
        "EDIT: clubs or competitions (e.g. CTF team)",
      ],
    },
  ],
};
