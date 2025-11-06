import resumeData from "../knowledge/resume.json";
import projectsData from "../knowledge/projects.json";
import { openSourceTool, getOpenSourceContributions } from "./opensource";

export function getContactInfo(): string {
  const { personal } = resumeData;
  return JSON.stringify({
    name: personal.name,
    email: personal.email,
    linkedin: personal.linkedin,
    github: personal.github,
    location: personal.location,
    message: "Feel free to reach out through any of these channels."
  }, null, 2);
}

export function scheduleMeeting(args?: { topic?: string }): string {
  const topic = args?.topic;
  return JSON.stringify({
    message: "I'd love to chat with you!",
    calendly: "https://calendly.com/abdulrasheedibrahim47/30min",
    suggestedTopics: topic ? [topic] : [
      "Technical discussion about my projects",
      "Career opportunities and collaboration",
      "Mentoring and knowledge sharing",
      "Consulting and contract work"
    ],
    availability: "Typically available Monday-Friday, 3 PM - 11 PM GMT"
  }, null, 2);
}

export function showcasePortfolio(args?: { category?: string }): string {
  const category = args?.category;
  const { projects: projectList } = projectsData;
  
  let relevantProjects = projectList;
  if (category) {
    const cat = category.toLowerCase();
    relevantProjects = projectList.filter((p: any) => 
      p.technologies.some((t: any) => t.toLowerCase().includes(cat)) ||
      p.name.toLowerCase().includes(cat) ||
      p.description.toLowerCase().includes(cat)
    );
  }

  return JSON.stringify({
    message: "Here are some of my notable projects:",
    projects: relevantProjects.map((p: any) => ({
      name: p.name,
      description: p.description,
      technologies: p.technologies,
      highlights: p.highlights,
      status: p.status
    })),
    totalProjects: projectList.length
  }, null, 2);
}

export function retrieveDocuments(args?: { documentType?: string }): string {
  const documentType = args?.documentType || "summary";
  const { personal, skills, achievements } = resumeData;

  if (documentType === "summary") {
    return JSON.stringify({
      name: personal.name,
      title: personal.title,
      bio: personal.bio,
      yearsOfExperience: personal.yearsOfExperience,
      topSkills: skills.languages.slice(0, 5).map((s: any) => s.name),
      keyAchievements: achievements.slice(0, 3)
    }, null, 2);
  }

  return JSON.stringify({
    personal,
    skills,
    achievements
  }, null, 2);
}

export function assessSkills(args?: { skillCategory?: string }): string {
  const { skills } = resumeData;
  
  return JSON.stringify({
    message: "Here's a comprehensive overview of my technical skills:",
    skills: {
      languages: skills.languages,
      frameworks: skills.frameworks,
      technologies: skills.technologies,
      practices: skills.practices
    },
    highlights: [
      "10+ years Python (Senior level)",
      "8+ years C (Senior level)",
      "7+ years JavaScript/TypeScript (Senior level)",
      "Active CPython contributor",
      "Expert in Django, React, React Native",
      "Strong TDD and Agile practices"
    ]
  }, null, 2);
}

export function getProjectDetails(args: { projectName: string }): string {
  const { projectName } = args;
  const project = projectsData.projects.find((p: any) =>
    p.name.toLowerCase().includes(projectName.toLowerCase()) ||
    (p.id && p.id === projectName)
  );

  if (!project) {
    return JSON.stringify({
      error: "Project not found",
      availableProjects: projectsData.projects.map((p: any) => ({ id: p.id, name: p.name })),
      message: "Please specify one of the available projects above."
    }, null, 2);
  }

  return JSON.stringify(project, null, 2);
}

export function getWorkExperience(): string {
  const { experience, achievements, personal } = resumeData;
  
  return JSON.stringify({
    message: `I have ${personal.yearsOfExperience}+ years of professional software engineering experience.`,
    experience,
    achievements,
    expertise: [
      "Building scalable backend systems",
      "Full-stack web development",
      "Mobile app development",
      "System design and architecture",
      "Team leadership and mentoring",
      "Performance optimization"
    ]
  }, null, 2);
}

export function checkAvailability(): string {
  const { availability } = resumeData;
  
  return JSON.stringify({
    status: availability.status,
    opportunityTypes: availability.types,
    remotePreference: availability.remotePreference,
    message: "I'm actively exploring new opportunities! Let's discuss how I can contribute to your team.",
    nextSteps: [
      "Tell me about the role or project",
      "Schedule a call to discuss further",
      "Share any specific requirements"
    ]
  }, null, 2);
}

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_contact_info",
      description: "Get Abdul's contact information including email, LinkedIn, GitHub, and location.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "schedule_meeting",
      description: "Get information about scheduling a meeting or call with Abdul, including Calendly link and availability.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Optional: the topic or purpose of the meeting"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "showcase_portfolio",
      description: "Display Abdul's portfolio projects, optionally filtered by category or technology.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Optional: filter projects by technology or category (e.g., 'python', 'react', 'backend')"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "retrieve_documents",
      description: "Get Abdul's resume, CV, or professional summary documents.",
      parameters: {
        type: "object",
        properties: {
          documentType: {
            type: "string",
            enum: ["resume", "cv", "summary"],
            description: "Type of document to retrieve"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "assess_skills",
      description: "Get detailed information about Abdul's technical skills, programming languages, frameworks, and practices.",
      parameters: {
        type: "object",
        properties: {
          skillCategory: {
            type: "string",
            description: "Optional: specific skill category to focus on"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_project_details",
      description: "Get detailed information about a specific project from Abdul's portfolio.",
      parameters: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "Name or ID of the project to get details about"
          }
        },
        required: ["projectName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_work_experience",
      description: "Get Abdul's detailed work history, professional experience, and career achievements.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "check_availability",
      description: "Check Abdul's current availability for new opportunities, contracts, or collaborations.",
      parameters: { type: "object", properties: {} }
    }
  },
  openSourceTool
];

export const toolExecutors: Record<string, (args: any) => Promise<string> | string> = {
  get_contact_info: () => getContactInfo(),
  schedule_meeting: (args) => scheduleMeeting(args),
  showcase_portfolio: (args) => showcasePortfolio(args),
  retrieve_documents: (args) => retrieveDocuments(args),
  assess_skills: (args) => assessSkills(args),
  get_project_details: (args) => getProjectDetails(args),
  get_work_experience: () => getWorkExperience(),
  check_availability: () => checkAvailability(),
  get_opensource_contributions: (args) => getOpenSourceContributions(args)
};
