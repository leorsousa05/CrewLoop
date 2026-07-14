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
  const dot =
    status === 'running'
      ? 'bg-running'
      : status === 'success'
      ? 'bg-success'
      : status === 'error'
      ? 'bg-error'
      : 'bg-text-muted';
  return (
    <span className={`inline-flex items-center gap-1.5 text-micro font-semibold uppercase px-1.5 py-0.5 rounded border ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
