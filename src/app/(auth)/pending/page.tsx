export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-3">
        <h1 className="text-xl font-medium">Awaiting approval</h1>
        <p className="text-sm text-gray-500">
          Your account has been created and is waiting for an admin to approve it.
          You'll be able to sign in once that happens.
        </p>
        <a href="/login" className="inline-block text-sm underline mt-2">
          Back to sign in
        </a>
      </div>
    </div>
  );
}
