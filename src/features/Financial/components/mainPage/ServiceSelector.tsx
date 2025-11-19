import ServiceGrid, { type ServiceType } from './ServiceGrid';

export type { ServiceType };

interface ServiceSelectorProps {
  selected?: ServiceType;
  onSelect: (type: ServiceType) => void;
  label?: string;
  className?: string;
}

export default function ServiceSelector({
  selected,
  onSelect,
  label = 'Top up destination',
  className = '',
}: ServiceSelectorProps) {
  return (
    <ServiceGrid
      selectedId={selected}
      onItemClick={onSelect}
      label={label}
      className={className}
    />
  );
}
