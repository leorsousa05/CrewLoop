import type { Graph3D } from '../../../../src/lib/graph';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import { Network3D } from '../Network3D';
import type { FilterOptions } from '../../lib/types';

interface Props {
  graph: Graph3D;
  filterOptions: FilterOptions;
}

export function NetworkView({ graph, filterOptions }: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Network" icon="Graph" />
      <FilterBar options={filterOptions} resultCount={graph.nodes.length} />
      <Network3D graph={graph} />
    </div>
  );
}
