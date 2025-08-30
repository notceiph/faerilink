import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Faeri Link
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          High-performance link-in-bio platform optimized for speed, personalization, and monetization.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/auth/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
          >
            Sign Up <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
