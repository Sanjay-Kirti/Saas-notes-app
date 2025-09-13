'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserInfo {
  email: string
  role: string
  tenant: {
    slug: string
    name: string
    plan: string
  }
}

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {user.tenant.name}
            </h1>
            <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
              user.tenant.plan === 'pro' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {user.tenant.plan.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            {user.role === 'admin' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
