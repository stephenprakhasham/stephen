const STEPS = [
  {
    title: "Pick your product",
    text: "Browse the store, or message the YAGA team and tell us what you need.",
  },
  {
    title: "Order online or on WhatsApp",
    text: "Check out on the store, or send your order in a WhatsApp message.",
  },
  {
    title: "Pay when it arrives",
    text: "Cash on delivery. Orders over ₹499 ship free.",
  },
];

export function HowToOrder() {
  return (
    <ol className="steps">
      {STEPS.map((s, i) => (
        <li key={s.title} className="step">
          <span className="step-num">{i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}