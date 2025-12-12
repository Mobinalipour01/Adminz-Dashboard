const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function registerMobileInstall(payload = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/installations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'pwa',
        installedAt: new Date().toISOString(),
        ...payload,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to register installation')
    }

    return response.json()
  } catch (error) {
    console.warn('registerMobileInstall error', error)
    return null
  }
}

