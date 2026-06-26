import { Icon } from './ui/Icon';

interface Props {
  title: string;
  icon?: string;
  children?: React.ReactNode;
}

export function ViewHeader({ title, icon, children }: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-default flex-shrink-0">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} className="w-5 h-5 text-accent" />}
        <h1 className="font-display text-3xl tracking-wide text-text-primary uppercase">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
