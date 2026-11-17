"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input
        type="email"
        placeholder="Your email address"
        required
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn gold" type="submit" style={{ whiteSpace: "nowrap" }}>
        {done ? "Subscribed ✓" : "Subscribe"}
      </button>
    </form>
  );
}