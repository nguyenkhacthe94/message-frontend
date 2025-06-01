"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { loginUser, registerUser } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const usernameOrEmail = formData.get("usernameOrEmail") as string
      const password = formData.get("password") as string

      const credentials = {
        usernameOrEmail,
        password,
        rememberMe,
      }

      const user = await loginUser(credentials)
      login(user)
    } catch (err) {
      console.error("Login error:", err)
      if (err instanceof Error) {
        if (err.message.includes("Cannot connect to API server")) {
          setError("Cannot connect to server. Please check if the API server is running.")
        } else if (err.message.includes("Login failed: 401")) {
          setError("Invalid username/email or password.")
        } else if (err.message.includes("Login failed: 400")) {
          setError("Please check your input and try again.")
        } else {
          setError(err.message)
        }
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const username = formData.get("username") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const user = await registerUser({ username, email, password })
      login(user)
    } catch (err) {
      console.error("Registration error:", err)
      if (err instanceof Error) {
        if (err.message.includes("Cannot connect to API server")) {
          setError("Cannot connect to server. Please check if the API server is running.")
        } else if (err.message.includes("Registration failed: 409")) {
          setError("Username or email already exists.")
        } else if (err.message.includes("Registration failed: 400")) {
          setError("Please check your input and try again.")
        } else {
          setError(err.message)
        }
      } else {
        setError("Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to MessageBoard</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-identifier">Username or Email</Label>
                  <Input id="login-identifier" name="usernameOrEmail" placeholder="Enter username or email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form action={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input id="register-username" name="username" placeholder="Choose a username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && <div className="mt-4 text-sm text-red-600 text-center">{error}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
