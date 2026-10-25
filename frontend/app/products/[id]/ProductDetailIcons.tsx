type IconName =
  | "home"
  | "chevron"
  | "star"
  | "cart"
  | "heart"
  | "verified"
  | "video"
  | "tag"
  | "play"
  | "truck"
  | "check"
  | "close";

export function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>;
    case "chevron":
      return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
    case "star":
      return <svg {...common} fill={filled ? "currentColor" : "none"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "cart":
      return <svg {...common}><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
    case "heart":
      return <svg {...common} fill={filled ? "currentColor" : "none"}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
    case "verified":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "video":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="m10 8 6 4-6 4V8Z" /></svg>;
    case "tag":
      return <svg {...common}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l6.4 6.4a3.1 3.1 0 0 1 0 4.4Z" /><circle cx="7.5" cy="7.5" r="1" /></svg>;
    case "play":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M8 5.8a1 1 0 0 1 1.5-.9l9.2 5.3a2 2 0 0 1 0 3.5l-9.2 5.3a1 1 0 0 1-1.5-.9V5.8Z" /></svg>;
    case "truck":
      return <svg {...common}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="17.5" cy="19" r="1.5" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "close":
      return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>;
  }
}
