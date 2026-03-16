'use client'

import { useState } from 'react'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate network request (We will wire this up to an email API later!)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSent(true)
  }

  if (isSent) {
    return (
      <div className="bg-teal/10 border-teal/20 mt-8 rounded-lg border p-6 text-center">
        <h3 className="text-teal text-lg font-medium">Message sent!</h3>
        <p className="text-text-muted mt-2 text-sm">
          Thanks for reaching out. I&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setIsSent(false)}
          className="text-text-muted hover:text-text-primary mt-4 text-sm transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-surface-border mt-8 flex flex-col gap-4 border-t pt-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="name" className="text-text-muted text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            required
            type="text"
            className="bg-surface-card border-surface-border text-text-primary focus:border-teal/50 focus:ring-teal/20 w-full rounded-md border px-3 py-2 text-sm transition-all outline-none focus:ring-2"
            placeholder="John Doe"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="email" className="text-text-muted text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            required
            type="email"
            className="bg-surface-card border-surface-border text-text-primary focus:border-teal/50 focus:ring-teal/20 w-full rounded-md border px-3 py-2 text-sm transition-all outline-none focus:ring-2"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-text-muted text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          className="bg-surface-card border-surface-border text-text-primary focus:border-teal/50 focus:ring-teal/20 w-full resize-none rounded-md border px-3 py-2 text-sm transition-all outline-none focus:ring-2"
          placeholder="What would you like to discuss?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-text-primary text-surface hover:bg-text-primary/90 disabled:bg-surface-border disabled:text-text-muted flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed sm:w-auto sm:self-start"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
