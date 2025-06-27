export default function ProjectsApp() {
  const projects = [
    {
      name: "MyHives",
      status: "Production",
      description:
        "Designed and led development of core microservices architecture using AWS CDK, Django, and React Native.",
      technologies: ["Python", "Django", "AWS", "React Native"],
      period: "Feb 2023 - Present",
      statusColor: "bg-green-600",
    },
    {
      name: "Isofy NAC System",
      status: "Enterprise",
      description:
        "Implemented NAC system management with remote reboot capabilities, roaming user support, and OfficeRND integration.",
      technologies: ["Django", "GraphQL", "React", "Cisco Meraki"],
      period: "Nov 2023 - Jan 2025",
      statusColor: "bg-yellow-600",
    },
    {
      name: "JobPro Microservices",
      status: "Architecture",
      description:
        "Led development of critical microservices with robust software architecture for enhanced scalability and performance.",
      technologies: ["Python", "Microservices", "Docker", "Kubernetes"],
      period: "Jan 2023 - Nov 2023",
      statusColor: "bg-purple-600",
    },
    {
      name: "Cryptocurrency Mining Backend",
      status: "Blockchain",
      description:
        "Built backend supporting cryptocurrency mining rigs with Bitcoin and Ethereum transaction handling.",
      technologies: ["Python", "C++", "Django", "Blockchain", "Web3"],
      period: "Mar 2021 - Sept 2021",
      statusColor: "bg-orange-600",
    },
  ]

  return (
    <div className="p-6 text-white h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-400">$ ls ~/projects/</h1>

      <div className="grid gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-400">{project.name}</h3>
              <span className={`text-xs ${project.statusColor} px-2 py-1 rounded`}>{project.status}</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs bg-blue-600 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400">{project.period}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
