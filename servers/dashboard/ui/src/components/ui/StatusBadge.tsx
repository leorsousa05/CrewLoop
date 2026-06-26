interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const color =
    status === 'running'
      ? 'text-running border-running/35'
      : status === 'success'
      ? 'text-success border-success/35'
      : status === 'error'
      ? 'text-error border-error/35'
      : 'text-text-muted border-border-default';
  return (
    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${color}`}>
      {status}
    </span>
  );
}
