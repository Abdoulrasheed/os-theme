export default function ResumeApp() {
  return (
    <div className="p-6 text-white h-full overflow-auto">
      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Abdulrasheed Ibrahim</h1>
          <p className="text-xl text-blue-400 mb-4">Senior Software Engineer</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p>📧 hello@abdull.dev</p>
              <p>📱 +2347033389645</p>
            </div>
            <div>
              <p>📍 Abuja, Nigeria</p>
              <p>🔗 linkedin.com/in/abdoulrasheed</p>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Experience</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">Senior Software Engineer</h3>
                  <p className="text-gray-300">Isofy - South Carolina, United States</p>
                </div>
                <span className="text-sm text-gray-400">Nov 2023 – Jan 2025</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                Contributed to NAC system implementation and Isofy Portal management, including remote NAC reboot,
                roaming user support, and OfficeRND integration.
              </p>
              <p className="text-xs text-gray-400">
                Skills: Django, Python, GraphQL, Juniper, Cisco Meraki, React, AWS
              </p>
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">Head of Engineering</h3>
                  <p className="text-gray-300">Zarttech B.V., The Hague, Netherlands</p>
                </div>
                <span className="text-sm text-gray-400">Jan 2023 – Nov 2023</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                Provided strategic leadership to engineering team, designed robust software architectures, and led
                technology stack decisions for enhanced scalability and performance.
              </p>
              <p className="text-xs text-gray-400">Skills: Python, Django, Microservices, AWS, Team Leadership</p>
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">Chief Technology Officer</h3>
                  <p className="text-gray-300">MyHives B.V.</p>
                </div>
                <span className="text-sm text-gray-400">Feb 2023 – Present</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                Designed and led development of core services, backend architecture, and cloud infrastructure using AWS
                CDK, Terraform, ECS, and comprehensive network setup.
              </p>
              <p className="text-xs text-gray-400">Skills: Python, Django, AWS CDK, Microservices, React Native</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Technical Skills</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Languages</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Python (Senior)</li>
                <li>• C (Senior)</li>
                <li>• JavaScript (Senior)</li>
                <li>• TypeScript (Senior)</li>
                <li>• Rust (Experienced)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Frameworks</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Django (Senior)</li>
                <li>• React/React Native (Senior)</li>
                <li>• FastAPI (Experienced)</li>
                <li>• Flask (Intermediate)</li>
                <li>• NextJS (Intermediate)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Infrastructure</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• AWS (Intermediate)</li>
                <li>• PostgreSQL (Senior)</li>
                <li>• Linux (Expert)</li>
                <li>• Docker/Kubernetes</li>
                <li>• Redis (Intermediate)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">
            Awards & Recognition
          </h2>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>
              🏆 <strong>Most Valuable Person (MVP)</strong> - Zarttech (Jul 2022)
            </li>
            <li>
              🎖️ <strong>Leadership Award</strong> - Zarttech (Aug 2022)
            </li>
            <li>
              ⭐ <strong>Rising Star Award</strong> - Best newcomer with most impact
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
