import { FAQ_ITEMS } from "@/lib/mobiles";

export function FAQ() {
  return (
    <div className="faq">
      {FAQ_ITEMS.map((item, i) => (
        <details key={item.q} open={i === 0 ? true : undefined}>
          <summary>
            {item.q}
            <i aria-hidden="true" />
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}