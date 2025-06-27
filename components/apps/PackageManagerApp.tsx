"use client"

import { useState } from "react"

interface Package {
  name: string
  version: string
  description: string
  category: string
  author: string
}

export default function PackageManagerApp() {
  const [searchTerm, setSearchTerm] = useState("")
  const [installingPackage, setInstallingPackage] = useState("")
  const [installedPackages, setInstalledPackages] = useState<string[]>([])

  const availablePackages: Package[] = [
    {
      name: "cpython-core",
      version: "3.12.0",
      description: "Core CPython interpreter with performance optimizations",
      category: "runtime",
      author: "Abdull Ibrahim",
    },
    {
      name: "django-microservices",
      version: "4.2.1",
      description: "Scalable Django microservices architecture toolkit",
      category: "framework",
      author: "Abdull Ibrahim",
    },
    {
      name: "react-native-tools",
      version: "0.72.0",
      description: "Cross-platform mobile development utilities",
      category: "mobile",
      author: "Abdull Ibrahim",
    },
    {
      name: "aws-infrastructure",
      version: "2.1.0",
      description: "AWS CDK templates for scalable cloud architecture",
      category: "cloud",
      author: "Abdull Ibrahim",
    },
    {
      name: "blockchain-utils",
      version: "1.5.2",
      description: "Bitcoin and Ethereum transaction handling utilities",
      category: "blockchain",
      author: "Abdull Ibrahim",
    },
  ]

  const filteredPackages = availablePackages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const installPackage = async (packageName: string) => {
    setInstallingPackage(packageName)

    // Simulate installation process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setInstalledPackages((prev) => [...prev, packageName])
    setInstallingPackage("")
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      runtime: "bg-blue-600",
      framework: "bg-green-600",
      mobile: "bg-purple-600",
      cloud: "bg-orange-600",
      blockchain: "bg-yellow-600",
    }
    return colors[category] || "bg-gray-600"
  }

  return (
    <div className="p-6 text-white h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-400">$ abdull package-manager</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Search packages..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{availablePackages.length}</div>
          <div className="text-sm text-gray-400">Available</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{installedPackages.length}</div>
          <div className="text-sm text-gray-400">Installed</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">5</div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
      </div>

      {/* Package List */}
      <div className="space-y-4">
        {filteredPackages.map((pkg) => (
          <div key={pkg.name} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-blue-400">{pkg.name}</h3>
                  <span className={`text-xs ${getCategoryColor(pkg.category)} px-2 py-1 rounded`}>{pkg.category}</span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">v{pkg.version}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{pkg.description}</p>
                <p className="text-xs text-gray-400">by {pkg.author}</p>
              </div>

              <div className="ml-4">
                {installedPackages.includes(pkg.name) ? (
                  <span className="px-4 py-2 bg-green-600 text-white rounded text-sm">✅ Installed</span>
                ) : installingPackage === pkg.name ? (
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded text-sm" disabled>
                    Installing...
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                    onClick={() => installPackage(pkg.name)}
                  >
                    Install
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-400 font-mono">$ abdull install {pkg.name}</div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No packages found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
