const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function subscribeToPushNotifications(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        channel: 'aws-pinpoint',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to subscribe to push notifications')
    }

    return response.json()
  } catch (error) {
    console.warn('subscribeToPushNotifications error', error)
    return null
  }
}

export async function triggerTestNotification() {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile/subscriptions/test`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to trigger test notification')
    }
  } catch (error) {
    console.warn('triggerTestNotification error', error)
  }
}

