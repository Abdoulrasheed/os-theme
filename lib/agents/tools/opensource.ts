import projectsData from "../knowledge/projects.json";

export const openSourceTool = {
  type: "function" as const,
  function: {
    name: "get_opensource_contributions",
    description:
      "Get information about Abdul's open-source contributions, especially his work on CPython (Python Programming Language core). Use this when asked about open-source experience, contributions, or community involvement.",
    parameters: {
      type: "object",
      properties: {
        focus: {
          type: "string",
          description: "Optional: specific project to focus on (e.g., 'cpython', 'python')",
          enum: ["cpython", "general", "all"],
        },
      },
    },
  },
};

export async function getOpenSourceContributions(args: { focus?: string }): Promise<string> {
  const focus = args.focus?.toLowerCase() || "all";

  const openSourceData = projectsData.openSource;

  if (focus === "cpython" || focus === "python") {
    const cpythonContrib = openSourceData.find((project) =>
      project.name.toLowerCase().includes("cpython")
    );

    if (cpythonContrib) {
      return JSON.stringify({
        highlighted: true,
        project: cpythonContrib.name,
        description: cpythonContrib.description,
        contributions: cpythonContrib.contributions,
        significance:
          "Active contributor to CPython, the reference implementation of Python used by millions of developers worldwide.",
        impact:
          "Contributes to one of the most important programming languages in the world, affecting the global developer community.",
      }, null, 2);
    }
  }

  return JSON.stringify({
    openSourceProjects: openSourceData,
    highlights: [
      "Active CPython contributor - contributes to the Python Programming Language core",
      "Multiple projects across Python and JavaScript ecosystems",
      "Focus on bug fixes, features, documentation, and community support",
      "Believes in giving back to the open-source community",
    ],
    primaryContribution: {
      project: "CPython (Python Programming Language)",
      role: "Active Contributor",
      activities: ["Bug fixes and improvements", "Code reviews", "Community support"],
    },
  }, null, 2);
}
