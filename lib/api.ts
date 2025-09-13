const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface LoginResponse {
  token: string
  user: {
    email: string
    role: string
    tenant: {
      slug: string
      name: string
      plan: string
    }
  }
}

export interface Note {
  id: string
  title: string
  content: string
  tenantId: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    email: string
  }
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  }

  async getNotes(): Promise<Note[]> {
    const response = await fetch(`${API_URL}/api/notes`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch notes')
    }

    return response.json()
  }

  async getNote(id: string): Promise<Note> {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch note')
    }

    return response.json()
  }

  async createNote(title: string, content: string): Promise<Note> {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, content }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create note')
    }

    return response.json()
  }

  async updateNote(id: string, title?: string, content?: string): Promise<Note> {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, content }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update note')
    }

    return response.json()
  }

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete note')
    }
  }

  async upgradeTenant(slug: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/tenants/${slug}/upgrade`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upgrade tenant')
    }
  }
}

export const api = new ApiClient()
