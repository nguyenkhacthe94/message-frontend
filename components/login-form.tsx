"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { loginUser, registerUser } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Validation functions
  const validateUsername = (username: string): string | null => {
    if (!username) return "Username is required"
    if (username.length < 5 || username.length > 20) return "Username must be 5-20 characters long"
    if (!/^[a-zA-Z0-9]+$/.test(username)) return "Username can only contain letters and numbers"
    return null
  }

  const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required"
    if (password.length < 8 || password.length > 20) return "Password must be 8-20 characters long"
    if (!/(?=.*[a-z])/.test(password)) return "Password must include at least one lowercase letter"
    if (!/(?=.*[A-Z])/.test(password)) return "Password must include at least one uppercase letter"
    if (!/(?=.*\d)/.test(password)) return "Password must include at least one number"
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password))
      return "Password must include at least one special character"
    return null
  }

  const handleRegisterInputChange = (field: keyof typeof registerForm, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }))

    // Real-time validation
    let error: string | null = null
    switch (field) {
      case "username":
        error = validateUsername(value)
        break
      case "email":
        error = validateEmail(value)
        break
      case "password":
        error = validatePassword(value)
        break
    }

    setValidationErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }))
  }

  const getValidationIcon = (field: keyof ValidationErrors) => {
    const value = registerForm[field]
    const error = validationErrors[field]

    if (!value) return null
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate all fields
    const usernameError = validateUsername(registerForm.username)
    const emailError = validateEmail(registerForm.email)
    const passwordError = validatePassword(registerForm.password)

    if (usernameError || emailError || passwordError) {
      setValidationErrors({
        username: usernameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
      })
      setIsLoading(false)
      return
    }

    try {
      const user = await registerUser({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      })
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
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <div className="relative">
                    <Input
                      id="register-username"
                      value={registerForm.username}
                      onChange={(e) => handleRegisterInputChange("username", e.target.value)}
                      placeholder="Choose a username (5-20 characters, letters and numbers only)"
                      className={
                        validationErrors.username
                          ? "border-red-500"
                          : registerForm.username && !validationErrors.username
                            ? "border-green-500"
                            : ""
                      }
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon("username")}
                    </div>
                  </div>
                  {validationErrors.username && <p className="text-sm text-red-600">{validationErrors.username}</p>}
                  {registerForm.username && !validationErrors.username && (
                    <p className="text-sm text-green-600">✓ Username is valid</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      className={
                        validationErrors.email
                          ? "border-red-500"
                          : registerForm.email && !validationErrors.email
                            ? "border-green-500"
                            : ""
                      }
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon("email")}
                    </div>
                  </div>
                  {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
                  {registerForm.email && !validationErrors.email && (
                    <p className="text-sm text-green-600">✓ Email is valid</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                      placeholder="Create a strong password (8-20 characters)"
                      className={
                        validationErrors.password
                          ? "border-red-500"
                          : registerForm.password && !validationErrors.password
                            ? "border-green-500"
                            : ""
                      }
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon("password")}
                    </div>
                  </div>
                  {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
                  {registerForm.password && !validationErrors.password && (
                    <p className="text-sm text-green-600">✓ Password meets all requirements</p>
                  )}
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Password must include:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={/(?=.*[a-z])/.test(registerForm.password) ? "text-green-600" : ""}>
                        One lowercase letter
                      </li>
                      <li className={/(?=.*[A-Z])/.test(registerForm.password) ? "text-green-600" : ""}>
                        One uppercase letter
                      </li>
                      <li className={/(?=.*\d)/.test(registerForm.password) ? "text-green-600" : ""}>One number</li>
                      <li
                        className={
                          /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(registerForm.password)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    !!(validationErrors.username || validationErrors.email || validationErrors.password) ||
                    !registerForm.username ||
                    !registerForm.email ||
                    !registerForm.password
                  }
                >
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
