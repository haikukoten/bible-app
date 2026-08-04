"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubscribeForm({ variant = "card" }: { variant?: "card" | "inline" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
          disabled={status === "loading"}
        />
        <Button type="submit" className="h-11 px-8 font-semibold shadow-sm transition-all hover:shadow-md" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      
      {message && (
        <p
          className={`text-sm text-center ${
            status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );

  if (variant === "inline") {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
        <div className="flex-1 md:pr-4">
          <h4 className="font-semibold text-lg md:text-xl text-foreground tracking-tight mb-1">
            Deepen Your Journey
          </h4>
          <p className="text-muted-foreground text-sm">
            Join our community for daily verses and spiritual reflections directly to your inbox.
          </p>
        </div>
        <div className="w-full max-w-sm shrink-0">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md my-8 p-6 bg-card rounded-lg border shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Subscribe to our newsletter</h3>
        <p className="text-muted-foreground text-sm">
          Get the latest posts delivered right to your inbox. No spam, we promise.
        </p>
      </div>
      {formContent}
    </div>
  );
}
