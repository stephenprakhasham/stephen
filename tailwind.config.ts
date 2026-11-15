import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink:"#151515", gold:"#C9A96E", cream:"#F7F4EE", navy:"#142C48" }, fontFamily: { sans:["Arial","sans-serif"] } } }, plugins: [] } satisfies Config;
