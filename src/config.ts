export const siteConfig = {
  name: "Nathan Getty",
  title: "Senior Security Engineer",
  description:
    "Nathan Getty — security platform engineer specializing in security automation across multi-cloud environments.",
  // Change this hex to recolor the whole site (hero, accents, hover states).
  accentColor: "#2563eb",
  social: {
    email: "gettynathanj@gmail.com",
    linkedin: "https://linkedin.com/in/gettysite",
    github: "https://github.com/getsec",
  },
  aboutMe:
    "Security platform engineer with 10+ years in infrastructure security, specializing in automating security services. I design automated security systems for multi-cloud environments and turn third-party security tools into scalable, developer-friendly platforms. Strong software engineering foundation in Python, Infrastructure as Code, and cloud-native architecture (GCP, AWS) — with a track record of reducing operational toil through automation while enabling engineering teams to move fast without compromising security.",
  skills: [
    "Python",
    "Terraform",
    "GCP",
    "AWS",
    "Azure",
    "Infrastructure as Code",
    "Serverless",
    "Docker",
    "Kubernetes",
    "SIEM / SOAR",
    "eBPF (Osquery, Uptycs)",
    "CI/CD",
    "Threat Modeling",
    "Cloud Security",
  ],
  // Repurposed as "Talks & Research" (see heading in src/components/Projects.astro).
  projects: [
    {
      name: "MCP: Making Compromise Possible — AI Workflows and Security Implications",
      description:
        "The Long Con (f/k/a B-Sides), 2025. Demonstrated prompt-injection attacks through live exploitation of AI workflows integrated with enterprise tools — showing how malicious content can compromise credentials and systems — with actionable recommendations for organizations deploying AI-assisted workflows.",
      link: "",
      skills: ["The Long Con", "2025", "AI Security"],
    },
    {
      name: "From Dangling DNS to Cloud Takeover",
      description:
        "WinniSEC, 2025. Research on subdomain-takeover vulnerabilities in cloud environments, demonstrating how dangling DNS records pointing to cloud provider IPs can be exploited — plus an automated detection system (AWS Lambda + Step Functions) monitoring DNS records across multi-cloud infrastructure.",
      link: "",
      skills: ["WinniSEC", "2025", "Cloud"],
    },
    {
      name: "Lessons from Security Companies: Managing Access in a Multi-Cloud World",
      description:
        "Apono, 2025. Case study on implementing just-in-time (JIT) access management across multi-cloud infrastructure — reducing access provisioning time from hours to minutes while eliminating 90% of standing privileged access.",
      link: "",
      skills: ["Apono", "2025", "JIT Access"],
    },
    {
      name: "AWS Application Security — Publication & Webcast",
      description:
        "Published guidance and delivered a webcast on application security practices for AWS environments.",
      link: "",
      skills: ["Publication", "2019", "AWS"],
    },
  ],
  experience: [
    {
      company: "Menlo Security Inc",
      title: "Senior Security Engineer",
      dateRange: "Jan 2021 - Present",
      bullets: [
        "Architected cloud security infrastructure during an AWS-to-GCP migration: automated security guardrails, policy enforcement, and API-driven security services enabling secure-by-default deployments across 10,000+ endpoints.",
        "Built an automated SOC platform on microservices (Firestore, Cloud Functions, Gemini AI) with a normalized alert-ingestion API, token auth, context enrichment, and AI-driven triage — cutting false positives via quarterly prompt-optimization cycles.",
        "Designed a production vulnerability-scanning platform that turned manual security operations into automated, API-driven self-service, reducing scan time from hours to minutes.",
        "Built a Just-In-Time access platform (Apono) across multi-cloud via Terraform, eliminating 90% of standing privileged access and cutting provisioning from up to 2 hours to 2-3 minutes.",
        "Built internal security platform components — domain monitoring, vulnerability scanning APIs, and agent orchestration on eBPF tooling (Uptycs, Osquery) — plus reusable CI/CD catalog items (image scanning, SonarQube) enabling shift-left security.",
        "Led threat modeling and security architecture reviews across AWS, GCP, and Azure, and drove SOC 2, FedRAMP (NIST 800-53), and CIS remediation through automated infrastructure changes.",
      ],
    },
    {
      company: "Just Eat / SkipTheDishes",
      title: "Senior Cloud Security Engineer",
      dateRange: "Dec 2019 - Jan 2021",
      bullets: [
        "Built a serverless security automation platform (CloudWatch Events, Lambda) for continuous monitoring, automated policy enforcement, and auto-remediation across AWS infrastructure.",
        "Built an API-driven remediation framework letting development teams self-service security fixes via API Gateway, reducing security-team toil and unblocking engineering workflows.",
        "Engineered pre-deployment security validation that blocked releases with critical misconfigurations, integrating automated security testing into CI/CD pipelines.",
        "Partnered with engineering teams to design security guardrails, establishing shift-left security practices across the organization.",
      ],
    },
    {
      company: "Wawanesa Mutual Insurance Company",
      title: "Senior Information Security Analyst",
      dateRange: "May 2015 - Dec 2019",
      bullets: [
        "Architected and led a cloud security initiative: an AWS security automation framework with least-privilege access controls, automated account provisioning, and role-based access management.",
        "Deployed a SOAR platform with API integrations for automated incident response, reducing mean time to contain and mitigate security risks across enterprise infrastructure.",
        "Built an automated web-application security testing framework and conducted manual penetration testing for business-critical applications.",
        "Deployed and integrated an enterprise security stack (SIEM, DLP, CASB, WAF) with internal tools and workflows.",
      ],
    },
  ],
  education: [
    {
      school: "Red River College",
      degree: "Diploma, Computer Networking",
      dateRange: "2014",
      achievements: [
        "Major in Computer Networking",
        "Cisco Certified Network Associate (CCNA)",
      ],
    },
    {
      school: "SANS / GIAC",
      degree: "Certifications & Training",
      dateRange: "2016 - 2022",
      achievements: [
        "GIAC GWAPT - Web Application Penetration Tester (2017)",
        "GIAC GCIA - Certified Intrusion Analyst (2016)",
        "SANS SEC540 - Cloud & DevOps Security Automation (2019)",
        "Advanced Programming with Python (2022)",
        "SANS Advisory Board Member (2017)",
      ],
    },
  ],
};
