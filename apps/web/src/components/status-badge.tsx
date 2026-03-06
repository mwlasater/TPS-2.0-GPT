interface StatusBadgeProps {
  tone: "success" | "warning" | "neutral";
  label: string;
}

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return <span className={`status-badge ${tone}`}>{label}</span>;
}
