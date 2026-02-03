export const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatPercent = (value: number) =>
  `${Math.round(Math.min(Math.max(value * 100, 0), 10000)) / 100}%`;

export const getRumScore = (value: number, name: string) => {
  if (name === "CLS") {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs";
    return "bad";
  }
  if (name === "LCP") {
    if (value <= 2500) return "good";
    if (value <= 4000) return "needs";
    return "bad";
  }
  if (name === "INP") {
    if (value <= 200) return "good";
    if (value <= 500) return "needs";
    return "bad";
  }
  return "neutral";
};
