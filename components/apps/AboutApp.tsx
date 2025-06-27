export default function AboutApp() {
  return (
    <div className="p-6 text-white h-full overflow-auto">
      <div className="max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            👨‍💻
          </div>
          <div>
            <h1 className="text-2xl font-bold">Abdulrasheed Ibrahim</h1>
            <p className="text-blue-400">Senior Software Engineer</p>
            <p className="text-gray-400">10+ years of experience</p>
          </div>
        </div>

        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-green-400">$ whoami</h2>
            <p className="text-gray-300 leading-relaxed">
              Senior Software Engineer with 10+ years of experience building scalable systems and writing high-quality
              code in Python, Javascript, Typescript, and C. Strong background in system design, performance
              optimization, and modern software practices like TDD and Agile. Passionate about solving complex problems
              and continuously improving codebases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-green-400">$ cat skills.txt</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-blue-400 font-medium mb-2">Languages</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Python (Senior)</li>
                  <li>• C (Senior)</li>
                  <li>• JavaScript (Senior)</li>
                  <li>• TypeScript (Senior)</li>
                  <li>• Rust (Experienced)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-blue-400 font-medium mb-2">Technologies</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Django (Senior)</li>
                  <li>• React/React Native (Senior)</li>
                  <li>• AWS (Intermediate)</li>
                  <li>• PostgreSQL (Senior)</li>
                  <li>• Linux (Expert)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-green-400">$ ls achievements/</h2>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• 🏆 Most Valuable Person (MVP) - Zarttech</li>
              <li>• 🎖️ Leadership Award - Zarttech</li>
              <li>• 🚀 Built scalable systems serving thousands of users</li>
              <li>• 👥 Mentored 10+ junior developers</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
