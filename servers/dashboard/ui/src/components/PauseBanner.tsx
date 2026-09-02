import { Icon } from './ui/Icon';

interface Props {
  bufferedCount: number;
  manual: boolean;
  onResume: () => void;
}

export function PauseBanner({ bufferedCount, manual, onResume }: Props) {
  return (
    <div role="status" aria-live="polite" className="pause-banner animate-banner-in flex items-center gap-3 px-5 min-h-9 flex-shrink-0 border-b border-accent">
      <Icon name="Pause" className="w-4 h-4 text-accent" weight="fill" />
      <span className="text-label text-text-primary">
        Paused{manual ? '' : ' (hover)'} — {bufferedCount} event{bufferedCount === 1 ? '' : 's'} buffered
      </span>
      <button type="button" onClick={onResume} className="btn-primary min-h-11 ml-auto !py-1 !text-label">
        Resume
      </button>
    </div>
  );
}
