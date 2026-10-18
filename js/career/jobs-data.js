/**
 * IT World — Job Openings Data
 * 
 * Centralized repository for full-time job listings on the Career page.
 * Company HR and administrators can update or add positions here.
 * 
 * NOTE: The current listings are sample openings for the initial design demonstration.
 * Each listing includes a "Sample Opening" badge as required until verified details are provided.
 */

export const JOB_OPENINGS = [
  {
    id: "dotnet-developer",
    title: ".NET Developer",
    department: "Software Development",
    employmentType: "Full-Time",
    experience: "Fresher / Entry-Level",
    location: "Bengaluru, Karnataka (Sample Location)",
    salary: "₹3,00,000 – ₹4,50,000 per annum (Sample Salary)",
    workMode: "Hybrid",
    isSample: true,
    sampleBadge: "Sample Opening",
    description: "We are looking for a motivated .NET Developer who is interested in building reliable software applications, writing maintainable code, and learning modern development practices.",
    responsibilities: [
      "Develop and maintain applications using the .NET ecosystem.",
      "Write clean, readable, and maintainable code.",
      "Collaborate with team members to implement features.",
      "Debug issues and improve application reliability.",
      "Learn and follow established development practices."
    ],
    requiredSkills: [
      "Basic knowledge of C# and .NET",
      "Understanding of object-oriented programming",
      "Basic knowledge of SQL and relational databases",
      "Problem-solving and willingness to learn"
    ],
    skillTags: ["C#", ".NET", "OOP", "SQL", "Relational Databases", "Git"]
  },
  {
    id: "react-developer",
    title: "React Developer",
    department: "Frontend Development",
    employmentType: "Full-Time",
    experience: "Fresher / Entry-Level",
    location: "Kolkata, West Bengal (Sample Location)",
    salary: "₹2,40,000 – ₹4,00,000 per annum (Sample Salary)",
    workMode: "Hybrid",
    isSample: true,
    sampleBadge: "Sample Opening",
    description: "We are looking for a motivated React Developer who enjoys building responsive user interfaces and creating smooth, user-friendly web experiences.",
    responsibilities: [
      "Develop responsive interfaces using React.",
      "Build reusable and maintainable UI components.",
      "Integrate frontend interfaces with APIs.",
      "Identify and fix UI and functionality issues.",
      "Collaborate with the team to improve user experience."
    ],
    requiredSkills: [
      "Basic knowledge of JavaScript, HTML, and CSS",
      "Understanding of React components, props, and state",
      "Basic knowledge of REST APIs",
      "Responsive design fundamentals"
    ],
    skillTags: ["React", "JavaScript (ES6+)", "HTML5 / CSS3", "REST APIs", "Responsive UI"]
  }
];

// Global attachment for compatibility
if (typeof window !== 'undefined') {
  window.IT_WORLD_JOB_OPENINGS = JOB_OPENINGS;
}
