import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // TODO: Replace with actual backend API call
    // For now, this is a mock implementation
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Mock validation - replace with actual API call to your backend
    // Example: const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {...})
    
    // For demo purposes, accept any credentials
    // In production, validate against your backend
    
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: { email }
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `auth-token=mock-token-${Date.now()}; Path=/; HttpOnly; SameSite=Strict`
        }
      }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
