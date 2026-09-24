export default function AuthCodeError() {
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Login failed</h1>
      <p className="text-gray-600">
        Something went wrong signing you in. Please try again.
      </p>
      <a href="/login" className="text-blue-600 underline mt-4 inline-block">
        Back to login
      </a>
    </div>
  )
}
