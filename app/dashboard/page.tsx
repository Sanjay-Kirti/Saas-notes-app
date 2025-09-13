'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, Note } from '@/lib/api'
import Navbar from '@/components/Navbar'

export default function DashboardPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    fetchNotes()
  }, [router])

  const fetchNotes = async () => {
    try {
      const data = await api.getNotes()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await api.deleteNote(id)
      setNotes(notes.filter(note => note.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  const handleUpgrade = async () => {
    try {
      await api.upgradeTenant(user.tenant.slug)
      const updatedUser = { ...user, tenant: { ...user.tenant, plan: 'pro' } }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      alert('Successfully upgraded to Pro plan!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upgrade')
    }
  }

  const canCreateNote = user?.tenant.plan === 'pro' || notes.length < 3

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            {canCreateNote ? (
              <Link
                href="/notes/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                New Note
              </Link>
            ) : (
              <div className="text-right">
                <p className="text-sm text-red-600 mb-2">
                  Free plan limited to 3 notes
                </p>
                {user?.role === 'admin' && (
                  <button
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new note.
              </p>
              {canCreateNote && (
                <div className="mt-6">
                  <Link
                    href="/notes/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Note
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {note.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {note.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/notes/${note.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {note.user && (
                      <div className="mt-2 text-xs text-gray-400">
                        By: {note.user.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
