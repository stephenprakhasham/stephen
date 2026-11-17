const STEPS = [
  {
    title: "Pick your product",
    text: "Browse the catalogue and choose the accessory you need.",
  },
  {
    title: "Order online or on WhatsApp",
    text: "Check out on the store, or send your order to our team on WhatsApp.",
  },
  {
    title: "Pay when it arrives",
    text: "Cash on Delivery. Free delivery on orders over ₹499.",
  },
];

export function HowToOrder() {
  return (
    <div className="steps">
      {STEPS.map((s, i) => (
        <div className="step" key={s.title}>
          <div className="step-num">{i + 1}</div>
          <strong>{s.title}</strong>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}