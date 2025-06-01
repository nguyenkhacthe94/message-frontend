const API_BASE = "http://localhost:8080/api/v1"

export interface User {
  id: string
  username: string
  email: string
}

// Updated Message interface to match the actual API response
export interface Message {
  id: number
  content: string
  username: string // Direct username instead of author object
  createdAt: string
  lastModifiedAt: string
  repliedToId: number | null
  replies: Message[] | null
  replyCount?: number
}

export interface LoginCredentials {
  usernameOrEmail: string
  password: string
  rememberMe?: boolean
}

export interface CreateMessageData {
  content: string
  parentId?: string
}

// Helper function to check if API server is reachable
async function checkApiHealth(): Promise<boolean> {
  try {
    console.log("🏥 Checking API health...")
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      mode: "cors",
    })
    console.log("🏥 API Health Check Status:", response.status)
    return response.ok
  } catch (error) {
    console.error("🏥 API Health Check Failed:", error)
    return false
  }
}

// Auth API calls
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const endpoint = `${API_BASE}/users/login`

  console.log("🔐 Login Request:")
  console.log("Endpoint:", endpoint)
  console.log("Payload:", JSON.stringify(credentials, null, 2))

  // Check if API is reachable first
  const isApiHealthy = await checkApiHealth()
  if (!isApiHealthy) {
    console.warn("⚠️ API server may not be running or reachable")
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors", // Explicitly set CORS mode
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    console.log("📡 Login Response Status:", response.status)
    console.log("📡 Login Response Headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Login Error Response:", errorText)
      throw new Error(`Login failed: ${response.status} - ${errorText}`)
    }

    const userData = await response.json()
    console.log("✅ Login Success:", userData)
    return userData
  } catch (error) {
    console.error("🚨 Login Exception:", error)

    // Enhanced error logging for network issues
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("🌐 Network Error Details:")
      console.error("- This is likely a CORS or connectivity issue")
      console.error("- Make sure your API server is running on http://localhost:8080")
      console.error("- Check if your API server has CORS enabled for http://localhost:3000")
      console.error("- Verify the API endpoint exists and is accessible")

      throw new Error("Cannot connect to API server. Please check if the server is running and CORS is configured.")
    }

    console.error("🚨 Error Details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

export async function registerUser(userData: LoginCredentials & { username: string; email: string }): Promise<User> {
  const endpoint = `${API_BASE}/users/register`

  console.log("📝 Register Request:")
  console.log("Endpoint:", endpoint)
  console.log("Payload:", JSON.stringify(userData, null, 2))

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    })

    console.log("📡 Register Response Status:", response.status)
    console.log("📡 Register Response Headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Register Error Response:", errorText)
      throw new Error(`Registration failed: ${response.status} - ${errorText}`)
    }

    const user = await response.json()
    console.log("✅ Register Success:", user)
    return user
  } catch (error) {
    console.error("🚨 Register Exception:", error)

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to API server. Please check if the server is running and CORS is configured.")
    }

    console.error("🚨 Error Details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

// Message API calls
export async function fetchMessages(): Promise<Message[]> {
  const endpoint = `${API_BASE}/messages`

  console.log("📨 Fetch Messages Request:")
  console.log("Endpoint:", endpoint)

  try {
    const response = await fetch(endpoint, {
      mode: "cors",
      headers: {
        Accept: "application/json",
      },
    })

    console.log("📡 Fetch Messages Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Fetch Messages Error Response:", errorText)
      throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`)
    }

    const messages = await response.json()
    console.log("✅ Fetch Messages Success:", messages)
    return messages
  } catch (error) {
    console.error("🚨 Fetch Messages Exception:", error)

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to API server. Please check if the server is running and CORS is configured.")
    }

    console.error("🚨 Error Details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

export async function fetchReplies(messageId: string | number): Promise<Message[]> {
  const endpoint = `${API_BASE}/messages/${messageId}/replies`

  console.log("💬 Fetch Replies Request:")
  console.log("Endpoint:", endpoint)
  console.log("Message ID:", messageId)

  try {
    const response = await fetch(endpoint, {
      mode: "cors",
      headers: {
        Accept: "application/json",
      },
    })

    console.log("📡 Fetch Replies Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Fetch Replies Error Response:", errorText)
      throw new Error(`Failed to fetch replies: ${response.status} - ${errorText}`)
    }

    const replies = await response.json()
    console.log("✅ Fetch Replies Success:", replies)
    return replies
  } catch (error) {
    console.error("🚨 Fetch Replies Exception:", error)

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to API server. Please check if the server is running and CORS is configured.")
    }

    console.error("🚨 Error Details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

export async function createMessage(messageData: CreateMessageData): Promise<Message> {
  const endpoint = `${API_BASE}/messages`

  console.log("✍️ Create Message Request:")
  console.log("Endpoint:", endpoint)
  console.log("Payload:", JSON.stringify(messageData, null, 2))

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messageData),
    })

    console.log("📡 Create Message Response Status:", response.status)
    console.log("📡 Create Message Response Headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Create Message Error Response:", errorText)
      throw new Error(`Failed to create message: ${response.status} - ${errorText}`)
    }

    const message = await response.json()
    console.log("✅ Create Message Success:", message)
    return message
  } catch (error) {
    console.error("🚨 Create Message Exception:", error)

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to API server. Please check if the server is running and CORS is configured.")
    }

    console.error("🚨 Error Details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}
