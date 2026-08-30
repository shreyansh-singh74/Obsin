import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useVaultStore } from '@/store/useVaultStore';
import { Network, Maximize2, Minimize2, X } from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  path: string;
  label: string;
  isCurrent: boolean;
  linkCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphViewProps {
  mode: 'inline' | 'overlay';
  onClose?: () => void;
}

function useGraphData() {
  const notes = useVaultStore((s) => s.notes);
  const activeVault = useVaultStore((s) => s.activeVault);
  const activeNotePath = useVaultStore((s) => s.activeNotePath);

  const graph = useMemo(() => {
    if (!notes.length || !activeVault) return { nodes: [], links: [] };

    const wikiLinkRegex = /\[\[([^\]|#]+?)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
    const noteMap = new Map<string, { path: string; name: string }>();
    const linkCountMap = new Map<string, number>();
    const edges: { source: string; target: string }[] = [];

    for (const note of notes) {
      noteMap.set(note.name.toLowerCase(), { path: note.path, name: note.name });
    }

    for (const note of notes) {
      let match: RegExpExecArray | null;
      const seenInNote = new Set<string>();

      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const targetName = match[1].trim().toLowerCase();
        if (seenInNote.has(targetName)) continue;
        seenInNote.add(targetName);

        if (noteMap.has(targetName)) {
          const target = noteMap.get(targetName)!;
          edges.push({ source: note.path, target: target.path });
          linkCountMap.set(note.path, (linkCountMap.get(note.path) || 0) + 1);
          linkCountMap.set(target.path, (linkCountMap.get(target.path) || 0) + 1);
        }
      }
    }

    const nodes: GraphNode[] = notes.map((note) => ({
      id: note.path,
      path: note.path,
      label: note.name,
      isCurrent: note.path === activeNotePath,
      linkCount: linkCountMap.get(note.path) || 0,
    }));

    return { nodes, links: edges };
  }, [notes, activeVault, activeNotePath]);

  return graph;
}

export const GraphView: React.FC<GraphViewProps> = ({ mode, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, links } = useGraphData();
  const setActiveNotePath = useVaultStore((s) => s.setActiveNotePath);
  const activeNotePath = useVaultStore((s) => s.activeNotePath);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const maxLinks = Math.max(1, ...nodes.map((n) => n.linkCount));
    const nodeRadius = (n: GraphNode) => 6 + (n.linkCount / maxLinks) * 18;

    // Clone links so D3 can mutate source/target to objects
    const simLinks: GraphLink[] = links.map((l) => ({ ...l }));

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(simLinks)
        .id((d) => d.id)
        .distance(120)
        .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => nodeRadius(d) + 4));

    const link = g.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', 'var(--border-subtle, #444)')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6);

    const nodeGroup = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (_event, d) => {
          if (!_event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (_event, d) => {
          if (!_event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

    nodeGroup.append('circle')
      .attr('r', (d: GraphNode) => nodeRadius(d))
      .attr('fill', (d: GraphNode) => d.isCurrent ? 'var(--accent, #8A35F2)' : 'var(--text-muted, #888)')
      .attr('stroke', (d: GraphNode) => d.isCurrent ? 'var(--accent, #8A35F2)' : 'transparent')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.3)
      .attr('opacity', 0.9);

    nodeGroup.append('text')
      .text((d: GraphNode) => d.label)
      .attr('x', 0)
      .attr('y', (d: GraphNode) => nodeRadius(d) + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary, #aaa)')
      .attr('font-size', '10px')
      .attr('font-family', 'inherit')
      .attr('pointer-events', 'none');

    nodeGroup.on('click', (_event: MouseEvent, d: GraphNode) => {
      setActiveNotePath(d.path);
    });

    nodeGroup
      .on('mouseenter', function(this: SVGGElement, _event: MouseEvent, d: GraphNode) {
        d3.select(this).select('circle')
          .transition()
          .duration(150)
          .attr('r', nodeRadius(d) + 3)
          .attr('opacity', 1);
      })
      .on('mouseleave', function(this: SVGGElement, _event: MouseEvent, d: GraphNode) {
        d3.select(this).select('circle')
          .transition()
          .duration(150)
          .attr('r', nodeRadius(d))
          .attr('opacity', 0.9);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: GraphLink) => (d.source as GraphNode).x || 0)
        .attr('y1', (d: GraphLink) => (d.source as GraphNode).y || 0)
        .attr('x2', (d: GraphLink) => (d.target as GraphNode).x || 0)
        .attr('y2', (d: GraphLink) => (d.target as GraphNode).y || 0);

      nodeGroup.attr('transform', (d: GraphNode) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, activeNotePath]);

  if (nodes.length === 0) return null;

  const content = (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[var(--surface-page)]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-[var(--text-muted)] bg-[var(--surface-card)]/80 backdrop-blur-sm rounded-md px-2 py-1.5 border border-[var(--border-subtle)]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          Current note
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
          Other notes
        </span>
        <span>{nodes.length} notes · {links.length} links</span>
      </div>
    </div>
  );

  if (mode === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-[var(--surface-page)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Network className="w-4 h-4 text-[var(--accent-text)]" />
              Note Graph
              <span className="text-xs font-normal text-[var(--text-muted)]">
                ({nodes.length} notes · {links.length} links)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <Maximize2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--surface-card)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          Graph
        </span>
      </div>
      <div className="h-[280px]">
        {content}
      </div>
    </div>
  );
};
