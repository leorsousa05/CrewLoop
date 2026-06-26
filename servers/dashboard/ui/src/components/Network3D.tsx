import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import type { ForceGraphMethods } from 'react-force-graph-3d';
import type { Graph3D, GraphLink, GraphNode } from '../../../src/lib/graph';
import { TYPE_COLORS } from '../../../src/lib/constants';
import { useSettings } from '../contexts/SettingsContext';
import { Icon } from './ui/Icon';

interface Props {
  graph: Graph3D;
}

export function Network3D({ graph }: Props) {
  const { resolvedTheme: theme, reducedMotion } = useSettings();
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stableNodesRef = useRef<Map<string, GraphNode>>(new Map());
  const stableLinksRef = useRef<Map<string, GraphLink>>(new Map());

  const normalizedGraph = useMemo(() => {
    const next = graph;
    const nodeIds = new Set<string>();
    const nodes: GraphNode[] = [];
    for (const n of next.nodes) {
      nodeIds.add(n.id);
      const existing = stableNodesRef.current.get(n.id);
      if (existing) {
        existing.weight = n.weight;
        existing.label = n.label;
        existing.type = n.type;
        nodes.push(existing);
      } else {
        stableNodesRef.current.set(n.id, n);
        nodes.push(n);
      }
    }
    for (const id of Array.from(stableNodesRef.current.keys())) {
      if (!nodeIds.has(id)) stableNodesRef.current.delete(id);
    }

    const linkKeys = new Set<string>();
    const links: GraphLink[] = [];
    for (const l of next.links) {
      const key = `${l.source}→${l.target}`;
      linkKeys.add(key);
      const existing = stableLinksRef.current.get(key);
      if (existing) {
        existing.weight = l.weight;
        links.push(existing);
      } else {
        stableLinksRef.current.set(key, l);
        links.push(l);
      }
    }
    for (const key of Array.from(stableLinksRef.current.keys())) {
      if (!linkKeys.has(key)) stableLinksRef.current.delete(key);
    }
    return { nodes, links };
  }, [graph]);

  const colors = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const resolve = (token: string) => {
      const raw = TYPE_COLORS[token];
      if (!raw.startsWith('var(')) return raw;
      const name = raw.slice(4, -1).trim();
      return root.getPropertyValue(name).trim() || '#888888';
    };
    return {
      skill: resolve('skill'),
      tool: resolve('tool'),
      file: resolve('file'),
      link: '#3f3f46',
    };
  }, [theme]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setError('WebGL is not available in this browser.');
    } catch {
      setError('Could not initialize WebGL.');
    }
  }, []);

  useEffect(() => {
    if (!fgRef.current || normalizedGraph.nodes.length === 0) return;
    const controls = (fgRef.current as unknown as { zoomToFit?: (duration: number) => void }).zoomToFit;
    if (controls) controls(reducedMotion ? 0 : 400);
  }, [normalizedGraph, reducedMotion]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted">
        <Icon name="Monitor" className="w-10 h-10" />
        <p>{error}</p>
      </div>
    );
  }

  if (normalizedGraph.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        Waiting for agent activity...
      </div>
    );
  }

  const linkSourceId = (l: GraphLink) => (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id);
  const linkTargetId = (l: GraphLink) => (typeof l.target === 'string' ? l.target : (l.target as GraphNode).id);

  const connected = selected
    ? normalizedGraph.links.filter((l) => linkSourceId(l) === selected.id || linkTargetId(l) === selected.id)
    : [];

  return (
    <div className="flex-1 relative min-h-0">
      <ForceGraph3D
        ref={fgRef}
        graphData={normalizedGraph}
        nodeColor={(n) => colors[(n as GraphNode).type] || colors.file}
        nodeRelSize={4}
        nodeVal={(n) => Math.max(1, (n as GraphNode).weight || 1)}
        nodeLabel="label"
        linkWidth={1}
        linkColor={() => colors.link}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        enableNavigationControls
        onNodeHover={(node) => setHovered(node ? (node as GraphNode) : null)}
        onNodeClick={(node) => {
          const n = node as GraphNode;
          setSelected(n);
          if (fgRef.current && n.x != null && n.y != null && n.z != null) {
            const coords = n as unknown as { x: number; y: number; z: number };
            fgRef.current.cameraPosition(
              { x: coords.x + 40, y: coords.y + 40, z: coords.z + 40 },
              coords,
              reducedMotion ? 0 : 400
            );
          }
        }}
        onEngineStop={() => {
          const controls = (fgRef.current as unknown as { zoomToFit?: (duration: number) => void })?.zoomToFit;
          if (controls) controls(reducedMotion ? 0 : 400);
        }}
        warmupTicks={reducedMotion ? 0 : 10}
        cooldownTicks={reducedMotion ? 0 : 120}
      />
      {(selected || hovered) && (
        <div className="absolute top-3 right-3 w-64 p-3 bg-surface border border-border-default rounded shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              {(selected || hovered)?.type}
            </span>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="text-text-muted hover:text-text-primary"
              >
                <Icon name="X" className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-text-primary break-words font-mono">{(selected || hovered)?.label}</p>
          {selected && (
            <p className="text-xs text-text-muted mt-2">{connected.length} connection(s)</p>
          )}
        </div>
      )}
    </div>
  );
}
