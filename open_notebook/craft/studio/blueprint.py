"""Generative Blueprint Engine: Data-to-Geometry Visual Synthesis.

Accepts structured graph definitions (topology JSON: nodes, edges, layout algorithms)
and mathematically computes vector coordinates (force-directed spring, hierarchical,
circular, grid) to render pure vector blueprints without static template constraints.
"""

from __future__ import annotations

import html
import json
import math
import random
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class BlueprintNode:
    id: str
    label: str
    role: str = "Node"
    color: Optional[str] = None
    icon: Optional[str] = None
    description: str = ""
    weight: float = 1.0
    x: float = 0.0
    y: float = 0.0
    vx: float = 0.0
    vy: float = 0.0
    width: float = 240.0
    height: float = 90.0


@dataclass
class BlueprintEdge:
    source: str
    target: str
    weight: float = 0.5
    style: str = "directional_flow"  # directional_flow, governance_constraint, bidirectional, dashed, solid
    label: str = ""
    color: Optional[str] = None


@dataclass
class BlueprintSpec:
    title: str = "SYSTEM ARCHITECTURE TOPOLOGY"
    subtitle: str = "Programmatic graph blueprint solved via geometric force physics"
    blueprint_type: str = "NetworkArchitecture"
    layout_algorithm: str = "force_directed_spring"  # force_directed_spring, circular, hierarchical, grid
    nodes: List[BlueprintNode] = field(default_factory=list)
    edges: List[BlueprintEdge] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


# Role-based color palette (vibrant, modern dark & light cyber-minimalist tones)
ROLE_COLORS = {
    "core": "#00F0FF",         # Electric Cyan
    "hub": "#00F0FF",
    "central": "#00F0FF",
    "input": "#00E599",        # Emerald Mint
    "source": "#00E599",
    "ai": "#A855F7",           # Neon Purple
    "compute": "#A855F7",
    "model": "#A855F7",
    "storage": "#F59E0B",      # Warm Amber / Gold
    "data": "#F59E0B",
    "database": "#F59E0B",
    "governance": "#EF4444",   # Crimson Coral
    "constraint": "#EF4444",
    "policy": "#EF4444",
    "security": "#FF007A",     # Vivid Rose
    "gateway": "#06B6D4",      # Sky Teal
    "api": "#06B6D4",
    "output": "#3B82F6",       # Cobalt Blue
    "service": "#6366F1",      # Indigo
    "analytics": "#10B981",    # Emerald
}


def parse_blueprint_spec(raw: Any, default_title: str = "System Architecture") -> BlueprintSpec:
    """Parse raw dictionary or JSON string into a structured BlueprintSpec."""
    if isinstance(raw, str):
        raw = raw.strip()
        # Look for JSON block if wrapped in markdown ```json ... ```
        m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
        if m:
            raw = m.group(1)
        try:
            data = json.loads(raw)
        except Exception:
            data = {}
    elif isinstance(raw, dict):
        data = raw
    else:
        data = {}

    title = str(data.get("title") or (data.get("metadata", {}).get("title") if isinstance(data.get("metadata"), dict) else "") or default_title)
    subtitle = str(data.get("subtitle") or (data.get("metadata", {}).get("subtitle") if isinstance(data.get("metadata"), dict) else "") or "Programmatic graph blueprint solved via geometric force physics")
    btype = str(data.get("type") or data.get("blueprint_type") or "NetworkArchitecture")
    layout = str(data.get("layout_algorithm") or data.get("layout") or "force_directed_spring").lower().strip()
    metadata = data.get("metadata") if isinstance(data.get("metadata"), dict) else {}

    raw_nodes = data.get("nodes") or []
    raw_edges = data.get("edges") or []

    nodes: List[BlueprintNode] = []
    for idx, rn in enumerate(raw_nodes):
        if not isinstance(rn, dict):
            continue
        nid = str(rn.get("id") or f"N{idx+1}")
        lbl = str(rn.get("label") or rn.get("title") or rn.get("name") or nid)
        role = str(rn.get("role") or rn.get("type") or "Node")
        col = rn.get("color")
        if not col or not str(col).startswith("#"):
            col = ROLE_COLORS.get(role.lower(), "#38BDF8")
        desc = str(rn.get("description") or rn.get("sub") or rn.get("subtitle") or "")
        weight = float(rn.get("weight") or 1.0)
        icon = str(rn.get("icon") or "")
        nodes.append(BlueprintNode(
            id=nid,
            label=lbl,
            role=role,
            color=col,
            icon=icon,
            description=desc,
            weight=weight,
        ))

    edges: List[BlueprintEdge] = []
    for re_item in raw_edges:
        if not isinstance(re_item, dict):
            continue
        src = str(re_item.get("source") or re_item.get("from") or "")
        tgt = str(re_item.get("target") or re_item.get("to") or "")
        if not src or not tgt:
            continue
        w = float(re_item.get("weight") or 0.5)
        style = str(re_item.get("style") or "directional_flow").lower().strip()
        lbl = str(re_item.get("label") or "")
        col = re_item.get("color")
        edges.append(BlueprintEdge(
            source=src,
            target=tgt,
            weight=w,
            style=style,
            label=lbl,
            color=col,
        ))

    return BlueprintSpec(
        title=title,
        subtitle=subtitle,
        blueprint_type=btype,
        layout_algorithm=layout,
        nodes=nodes,
        edges=edges,
        metadata=metadata,
    )


# ------------------------------------------------------------------- Layout Solvers


def solve_force_directed_spring(
    nodes: List[BlueprintNode],
    edges: List[BlueprintEdge],
    width: float = 1600.0,
    height: float = 1100.0,
    margin_x: float = 180.0,
    margin_y: float = 240.0,
    iterations: int = 140,
) -> None:
    """Fruchterman-Reingold force-directed physical spring embedder simulation."""
    n = len(nodes)
    if n == 0:
        return

    cx = width / 2.0
    cy = (height + 60.0) / 2.0
    usable_w = width - 2 * margin_x
    usable_h = height - 2 * margin_y
    area = usable_w * usable_h

    # Optimal spring distance between nodes
    k = math.sqrt(area / max(1, n)) * 0.92

    rng = random.Random(42 + n)

    # Initial placement: distribute roughly on an ellipse around center
    for i, node in enumerate(nodes):
        # Place core/hub nodes nearer to center
        is_core = any(node.role.lower() == c for c in ("core", "hub", "central"))
        base_r = (k * 0.4) if is_core else (k * 1.2 + rng.uniform(-40, 40))
        angle = (2.0 * math.pi * i / n) + rng.uniform(-0.2, 0.2)
        node.x = cx + base_r * math.cos(angle)
        node.y = cy + (base_r * 0.75) * math.sin(angle)
        node.vx = 0.0
        node.vy = 0.0

    node_dict = {node.id: node for node in nodes}

    # Simulation temperature schedule
    temp = usable_w / 8.0
    initial_temp = temp

    for step in range(iterations):
        # 1. Repulsive forces between every pair of nodes (Coulomb's Law)
        for i in range(n):
            u = nodes[i]
            for j in range(i + 1, n):
                v = nodes[j]
                dx = u.x - v.x
                dy = u.y - v.y
                dist = math.hypot(dx, dy)
                if dist < 1.0:
                    dx = rng.uniform(-2, 2)
                    dy = rng.uniform(-2, 2)
                    dist = math.hypot(dx, dy) or 1.0

                # Stronger repulsion if nodes are too close to avoid card overlap
                min_sep = (u.width + v.width) * 0.55
                repel_factor = 2.5 if dist < min_sep else 1.0

                force = (k * k / dist) * repel_factor
                fx = (dx / dist) * force
                fy = (dy / dist) * force

                u.vx += fx
                u.vy += fy
                v.vx -= fx
                v.vy -= fy

        # 2. Attractive forces along edges (Hooke's Law springs)
        for e in edges:
            u = node_dict.get(e.source)
            v = node_dict.get(e.target)
            if not u or not v:
                continue
            dx = v.x - u.x
            dy = v.y - u.y
            dist = math.hypot(dx, dy)
            if dist < 1.0:
                continue

            # Weight controls spring stiffness
            stiffness = max(0.2, min(2.0, e.weight * 1.5))
            force = ((dist * dist) / k) * stiffness
            fx = (dx / dist) * force
            fy = (dy / dist) * force

            u.vx += fx
            u.vy += fy
            v.vx -= fx
            v.vy -= fy

        # 3. Center gravity force (keeps unattached or weak nodes bound to the canvas)
        for node in nodes:
            is_core = any(node.role.lower() == c for c in ("core", "hub", "central"))
            grav_strength = 0.08 if is_core else 0.03
            node.vx += (cx - node.x) * grav_strength
            node.vy += (cy - node.y) * grav_strength

        # 4. Apply velocities capped by current temperature
        for node in nodes:
            v_len = math.hypot(node.vx, node.vy)
            if v_len > 0.001:
                disp = min(v_len, temp)
                node.x += (node.vx / v_len) * disp
                node.y += (node.vy / v_len) * disp

            # Reset velocities
            node.vx = 0.0
            node.vy = 0.0

            # Clamp inside bounding margins
            half_w = node.width / 2.0
            half_h = node.height / 2.0
            node.x = max(margin_x + half_w, min(width - margin_x - half_w, node.x))
            node.y = max(margin_y + half_h, min(height - 120.0 - half_h, node.y))

        # Cooling
        temp = initial_temp * (1.0 - (step + 1) / iterations)


def solve_hierarchical(
    nodes: List[BlueprintNode],
    edges: List[BlueprintEdge],
    width: float = 1600.0,
    height: float = 1100.0,
    margin_x: float = 120.0,
    margin_y: float = 240.0,
) -> None:
    """Layered DAG topological layout solver."""
    n = len(nodes)
    if n == 0:
        return

    node_dict = {node.id: node for node in nodes}
    in_degree = {node.id: 0 for node in nodes}
    out_degree = {node.id: 0 for node in nodes}
    adj: Dict[str, List[str]] = {node.id: [] for node in nodes}

    for e in edges:
        if e.source in in_degree and e.target in in_degree:
            out_degree[e.source] += 1
            in_degree[e.target] += 1
            adj[e.source].append(e.target)

    # Assign layers based on depth
    layers: Dict[int, List[BlueprintNode]] = {}
    assigned_layer: Dict[str, int] = {}

    # Roots have in_degree 0 or core/input role
    roots = [node for node in nodes if in_degree[node.id] == 0 or node.role.lower() in ("input", "source", "core")]
    if not roots:
        roots = [nodes[0]]

    current_layer = 0
    current_nodes = roots
    visited = set()

    while current_nodes:
        layers[current_layer] = []
        next_nodes = []
        for node in current_nodes:
            if node.id in visited:
                continue
            visited.add(node.id)
            assigned_layer[node.id] = current_layer
            layers[current_layer].append(node)
            for tgt_id in adj.get(node.id, []):
                if tgt_id not in visited and tgt_id in node_dict:
                    next_nodes.append(node_dict[tgt_id])

        # Filter unique
        seen_next = set()
        unique_next = []
        for x in next_nodes:
            if x.id not in seen_next and x.id not in visited:
                seen_next.add(x.id)
                unique_next.append(x)

        current_nodes = unique_next
        current_layer += 1

    # Catch remaining unvisited nodes into a final layer
    unvisited = [node for node in nodes if node.id not in visited]
    if unvisited:
        layers[current_layer] = unvisited

    # Position layers vertically, nodes horizontally
    num_layers = max(1, len(layers))
    usable_h = (height - margin_y - 120.0)
    layer_step = usable_h / max(1, num_layers)

    for l_idx, l_nodes in layers.items():
        ly = margin_y + l_idx * layer_step + 40.0
        n_in_l = len(l_nodes)
        col_step = (width - 2 * margin_x) / max(1, n_in_l + 1)
        for c_idx, node in enumerate(l_nodes):
            node.x = margin_x + (c_idx + 1) * col_step
            node.y = ly


def solve_circular(
    nodes: List[BlueprintNode],
    edges: List[BlueprintEdge],
    width: float = 1600.0,
    height: float = 1100.0,
) -> None:
    """Concentric circular / orbital topology solver."""
    n = len(nodes)
    if n == 0:
        return

    cx = width / 2.0
    cy = (height + 80.0) / 2.0

    core_nodes = [node for node in nodes if node.role.lower() in ("core", "hub", "central")]
    sat_nodes = [node for node in nodes if node not in core_nodes]

    # Place core nodes
    if len(core_nodes) == 1:
        core_nodes[0].x = cx
        core_nodes[0].y = cy
    elif len(core_nodes) > 1:
        c_radius = 160.0
        for i, cnode in enumerate(core_nodes):
            ang = (2.0 * math.pi * i / len(core_nodes)) - (math.pi / 2.0)
            cnode.x = cx + c_radius * math.cos(ang)
            cnode.y = cy + (c_radius * 0.8) * math.sin(ang)

    # Place satellite nodes in outer orbit
    if sat_nodes:
        rx = 520.0
        ry = 320.0
        n_sat = len(sat_nodes)
        for i, snode in enumerate(sat_nodes):
            ang = (2.0 * math.pi * i / n_sat) - (math.pi / 2.0)
            snode.x = cx + rx * math.cos(ang)
            snode.y = cy + ry * math.sin(ang)


def solve_grid(
    nodes: List[BlueprintNode],
    edges: List[BlueprintEdge],
    width: float = 1600.0,
    height: float = 1100.0,
    margin_x: float = 140.0,
    margin_y: float = 240.0,
) -> None:
    """Structured orthogonal matrix grid solver."""
    n = len(nodes)
    if n == 0:
        return

    cols = math.ceil(math.sqrt(n * 1.5))
    rows = math.ceil(n / max(1, cols))

    col_step = (width - 2 * margin_x) / max(1, cols)
    row_step = (height - margin_y - 120.0) / max(1, rows)

    for i, node in enumerate(nodes):
        r = i // cols
        c = i % cols
        node.x = margin_x + (c + 0.5) * col_step
        node.y = margin_y + (r + 0.5) * row_step


# ------------------------------------------------------------------- Vector Geometry Renderer


def _clip_line_to_rect(
    x1: float, y1: float, x2: float, y2: float, w: float, h: float
) -> Tuple[float, float]:
    """Calculate intersection point of ray (x1, y1)->(x2, y2) exiting rectangle centered at (x1, y1)."""
    dx = x2 - x1
    dy = y2 - y1
    if abs(dx) < 1e-5 and abs(dy) < 1e-5:
        return x1, y1

    half_w = w / 2.0
    half_h = h / 2.0

    # Test ray to 4 bounding planes
    scale_x = half_w / abs(dx) if abs(dx) > 1e-5 else 1e9
    scale_y = half_h / abs(dy) if abs(dy) > 1e-5 else 1e9
    scale = min(scale_x, scale_y)

    return x1 + dx * scale, y1 + dy * scale


def _sketch_line(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    rng: random.Random,
    wobble: float = 1.4,
    overshoot: float = 3.5,
) -> str:
    """Hand-drawn line with subtle midpoint wobble and architect corner overshoot."""
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist < 1e-4:
        return f"M {x1:.1f} {y1:.1f} L {x2:.1f} {y2:.1f}"
    ux = dx / dist
    uy = dy / dist
    sx = x1 - ux * overshoot + rng.uniform(-0.6, 0.6)
    sy = y1 - uy * overshoot + rng.uniform(-0.6, 0.6)
    ex = x2 + ux * overshoot + rng.uniform(-0.6, 0.6)
    ey = y2 + uy * overshoot + rng.uniform(-0.6, 0.6)
    mx = (sx + ex) / 2.0 - uy * rng.uniform(-wobble, wobble)
    my = (sy + ey) / 2.0 + ux * rng.uniform(-wobble, wobble)
    return f"M {sx:.1f} {sy:.1f} Q {mx:.1f} {my:.1f} {ex:.1f} {ey:.1f}"


def _sketch_box_paths(
    x: float, y: float, w: float, h: float, rng: random.Random, overshoot: float = 4.0
) -> List[str]:
    """Hand-sketched box with 4 overlapping lines plus a secondary parallel sketch stroke."""
    return [
        _sketch_line(x, y, x + w, y, rng, wobble=1.2, overshoot=overshoot),
        _sketch_line(x + w, y, x + w, y + h, rng, wobble=1.2, overshoot=overshoot),
        _sketch_line(x + w, y + h, x, y + h, rng, wobble=1.2, overshoot=overshoot),
        _sketch_line(x, y + h, x, y, rng, wobble=1.2, overshoot=overshoot),
        # Secondary faint stroke for the double-sketched architect look
        _sketch_line(x + 1, y + 1, x + w - 1, y + 1, rng, wobble=1.5, overshoot=overshoot * 0.6),
        _sketch_line(x + w - 1, y + 1, x + w - 1, y + h - 1, rng, wobble=1.5, overshoot=overshoot * 0.6),
        _sketch_line(x + w - 1, y + h - 1, x + 1, y + h - 1, rng, wobble=1.5, overshoot=overshoot * 0.6),
        _sketch_line(x + 1, y + h - 1, x + 1, y + 1, rng, wobble=1.5, overshoot=overshoot * 0.6),
    ]


def _sketch_circle_path(cx: float, cy: float, r: float, rng: random.Random) -> str:
    """Hand-drawn overlapping circle path (loops ~1.18 times like someone circling twice)."""
    steps = 14
    points = []
    total_angle = 2.0 * math.pi + 0.6
    for i in range(steps + 1):
        theta = (total_angle * i / steps) - (math.pi / 2.0)
        cur_r = r + rng.uniform(-1.5, 1.5)
        points.append((cx + cur_r * math.cos(theta), cy + cur_r * math.sin(theta)))
    d = f"M {points[0][0]:.1f} {points[0][1]:.1f}"
    for i in range(1, len(points)):
        p0, p1 = points[i - 1], points[i]
        mx = (p0[0] + p1[0]) / 2.0 + rng.uniform(-1.0, 1.0)
        my = (p0[1] + p1[1]) / 2.0 + rng.uniform(-1.0, 1.0)
        d += f" Q {mx:.1f} {my:.1f} {p1[0]:.1f} {p1[1]:.1f}"
    return d


def _sketch_arrow_head(
    tx: float, ty: float, from_x: float, from_y: float, rng: random.Random, size: float = 14.0
) -> List[str]:
    """Two hand-drawn angled barb strokes forming a hand-drawn arrowhead."""
    dx, dy = tx - from_x, ty - from_y
    dist = math.hypot(dx, dy)
    if dist < 1e-4:
        return []
    angle = math.atan2(dy, dx)
    b1_ang = angle + math.pi - 0.46 + rng.uniform(-0.06, 0.06)
    b2_ang = angle + math.pi + 0.46 + rng.uniform(-0.06, 0.06)
    b1_x = tx + size * math.cos(b1_ang)
    b1_y = ty + size * math.sin(b1_ang)
    b2_x = tx + size * math.cos(b2_ang)
    b2_y = ty + size * math.sin(b2_ang)
    return [
        _sketch_line(tx, ty, b1_x, b1_y, rng, wobble=0.6, overshoot=1.0),
        _sketch_line(tx, ty, b2_x, b2_y, rng, wobble=0.6, overshoot=1.0),
    ]


def render_blueprint_svg(spec: BlueprintSpec, mode: str = "dark") -> Tuple[str, int]:
    """Render the BlueprintSpec into a high-precision, mathematical SVG."""
    style_override = str(spec.metadata.get("style_override") or spec.metadata.get("style") or "").lower()
    design_style = str(spec.metadata.get("design_style") or "").lower()
    inst = str(spec.metadata.get("instructions") or "").lower()
    is_handwritten = any(
        k in style_override or k in design_style or k in inst
        for k in ("handwritten", "sketch", "hand_drawn", "whiteboard", "chalkboard", "doodle", "rough")
    )
    if is_handwritten:
        return render_handwritten_sketch_svg(spec, mode)

    W = 1600
    H = 1200
    e = lambda s: html.escape(str(s))

    # Apply layout solver
    algo = spec.layout_algorithm.lower()
    if "hierarch" in algo or "dag" in algo or "tree" in algo:
        solve_hierarchical(spec.nodes, spec.edges, W, H)
    elif "circ" in algo or "radial" in algo or "orbit" in algo:
        solve_circular(spec.nodes, spec.edges, W, H)
    elif "grid" in algo or "matrix" in algo:
        solve_grid(spec.nodes, spec.edges, W, H)
    else:
        solve_force_directed_spring(spec.nodes, spec.edges, W, H)

    # Palette
    is_dark = mode == "dark"
    bg = "#070B14" if is_dark else "#F8FAFC"
    grid_line = "#131C31" if is_dark else "#E2E8F0"
    card_bg = "#0B1528" if is_dark else "#FFFFFF"
    card_border = "#1E2E4E" if is_dark else "#CBD5E1"
    text_primary = "#F1F5F9" if is_dark else "#0F172A"
    text_muted = "#94A3B8" if is_dark else "#64748B"
    accent_pulse = "#00F0FF" if is_dark else "#0284C7"
    accent_gold = "#F59E0B"
    accent_coral = "#EF4444"

    node_dict = {n.id: n for n in spec.nodes}

    parts: List[str] = []

    # SVG Defs: Grid Pattern, Glow Filter, Dynamic Markers
    defs = f"""<defs>
      <!-- Architectural Grid Pattern -->
      <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="{grid_line}" stroke-width="1" stroke-opacity="0.6"/>
        <circle cx="40" cy="40" r="1.5" fill="{grid_line}" fill-opacity="0.8"/>
      </pattern>

      <!-- Glow Filter -->
      <filter id="vector-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <!-- Soft Shadow -->
      <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="{'0.45' if is_dark else '0.12'}"/>
      </filter>

      <!-- Flow Arrowhead (Cyan) -->
      <marker id="marker-arrow-flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="{accent_pulse}"/>
      </marker>

      <!-- Governance Arrowhead (Coral) -->
      <marker id="marker-arrow-constraint" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="{accent_coral}"/>
      </marker>

      <!-- Gold Accent Arrow -->
      <marker id="marker-arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="{accent_gold}"/>
      </marker>

      <!-- Diamond Marker for Policies -->
      <marker id="marker-diamond" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 5 0 L 10 5 L 5 10 L 0 5 z" fill="{accent_coral}"/>
      </marker>
    </defs>"""
    parts.append(defs)

    # 1. Background Grid & Ambient Glows
    parts.append(f'<rect width="{W}" height="{H}" fill="{bg}"/>')
    parts.append(f'<rect width="{W}" height="{H}" fill="url(#arch-grid)"/>')

    # Ambient radial glow behind canvas center
    parts.append(
        f'<radialGradient id="center-glow" cx="50%" cy="50%" r="45%">'
        f'<stop offset="0%" stop-color="{accent_pulse}" stop-opacity="{"0.08" if is_dark else "0.04"}"/>'
        f'<stop offset="100%" stop-color="{bg}" stop-opacity="0"/>'
        f'</radialGradient>'
        f'<rect x="200" y="150" width="{W - 400}" height="{H - 250}" fill="url(#center-glow)"/>'
    )

    # 2. Header & Blueprint Telemetry Banner
    top_y = 50
    margin_l = 80
    parts.append(f'<rect x="{margin_l}" y="{top_y}" width="300" height="32" rx="16" fill="{accent_pulse}" fill-opacity="0.12" stroke="{accent_pulse}" stroke-width="1.2"/>')
    parts.append(f'<circle cx="{margin_l + 16}" cy="{top_y + 16}" r="4" fill="{accent_pulse}" filter="url(#vector-glow)"/>')
    parts.append(f'<text x="{margin_l + 30}" y="{top_y + 21}" font-family="\'Inter\', \'Segoe UI\', sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="{accent_pulse}">GENERATIVE BLUEPRINT ENGINE</text>')

    top_y += 54
    title_text = spec.title.upper()
    parts.append(f'<text x="{margin_l}" y="{top_y}" font-family="\'Nohemi\', \'Inter\', sans-serif" font-size="36" font-weight="800" fill="{text_primary}">{e(title_text)}</text>')

    top_y += 26
    sub_text = spec.subtitle
    parts.append(f'<text x="{margin_l}" y="{top_y}" font-family="\'Libre Franklin\', \'Inter\', sans-serif" font-size="16" fill="{text_muted}">{e(sub_text[:140])}</text>')

    # Top right badges: Algorithm & Topology metrics
    right_x = W - margin_l
    badge_w = 420
    parts.append(f'<g transform="translate({right_x - badge_w}, 45)">')
    parts.append(f'<rect width="{badge_w}" height="64" rx="8" fill="{card_bg}" stroke="{card_border}" stroke-width="1.2"/>')
    parts.append(f'<text x="20" y="26" font-family="\'Inter\', sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="{text_muted}">TOPOLOGY SOLVER</text>')
    parts.append(f'<text x="20" y="48" font-family="\'Inter\', sans-serif" font-size="14" font-weight="700" fill="{accent_pulse}">{e(spec.layout_algorithm.upper().replace("_", " "))}</text>')
    parts.append(f'<line x1="220" y1="14" x2="220" y2="50" stroke="{card_border}" stroke-width="1"/>')
    parts.append(f'<text x="240" y="26" font-family="\'Inter\', sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="{text_muted}">SYSTEM SCALE</text>')
    parts.append(f'<text x="240" y="48" font-family="\'Inter\', sans-serif" font-size="14" font-weight="700" fill="{text_primary}">{len(spec.nodes)} NODES · {len(spec.edges)} FLOWS</text>')
    parts.append('</g>')

    # 3. Edges (Mathematical Vector Bezier Connections)
    for edge in spec.edges:
        u = node_dict.get(edge.source)
        v = node_dict.get(edge.target)
        if not u or not v:
            continue

        # Clip edge start and end to node rectangle borders
        sx, sy = _clip_line_to_rect(u.x, u.y, v.x, v.y, u.width, u.height)
        tx, ty = _clip_line_to_rect(v.x, v.y, u.x, u.y, v.width, v.height)

        dx = tx - sx
        dy = ty - sy
        dist = math.hypot(dx, dy)

        # Style attributes
        is_governance = "governance" in edge.style or "constraint" in edge.style
        is_dashed = is_governance or "dashed" in edge.style
        edge_col = edge.color or (accent_coral if is_governance else accent_pulse)
        marker = "url(#marker-arrow-constraint)" if is_governance else "url(#marker-arrow-flow)"
        stroke_w = max(1.6, min(4.5, 1.4 + edge.weight * 2.2))
        dash_attr = 'stroke-dasharray="7 5"' if is_dashed else ""

        # Compute smooth curved control points perpendicular to chord
        curvature = 0.12 if dist > 180 else 0.06
        # Slight organic curvature
        mx = (sx + tx) / 2.0 - dy * curvature
        my = (sy + ty) / 2.0 + dx * curvature

        path_d = f"M {sx:.1f} {sy:.1f} Q {mx:.1f} {my:.1f} {tx:.1f} {ty:.1f}"

        # Draw edge line
        parts.append(f'<path d="{path_d}" fill="none" stroke="{edge_col}" stroke-width="{stroke_w}" stroke-opacity="{"0.75" if is_dark else "0.85"}" {dash_attr} marker-end="{marker}"/>')

        # Optional edge label
        if edge.label:
            lbl_w = len(edge.label) * 7.5 + 16
            parts.append(f'<rect x="{mx - lbl_w/2:.1f}" y="{my - 11:.1f}" width="{lbl_w:.1f}" height="22" rx="4" fill="{card_bg}" stroke="{edge_col}" stroke-width="1" stroke-opacity="0.8"/>')
            parts.append(f'<text x="{mx:.1f}" y="{my + 4:.1f}" text-anchor="middle" font-family="\'Inter\', sans-serif" font-size="11" font-weight="600" fill="{edge_col}">{e(edge.label)}</text>')

    # 4. Nodes (Vector Glassmorphic Cards)
    for node in spec.nodes:
        bx = node.x - node.width / 2.0
        by = node.y - node.height / 2.0
        col = node.color or accent_pulse
        is_core = any(node.role.lower() == c for c in ("core", "hub", "central"))

        # Card container with shadow
        parts.append(f'<g filter="url(#card-shadow)">')
        parts.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="{node.width:.1f}" height="{node.height:.1f}" rx="12" fill="{card_bg}" stroke="{col if is_core else card_border}" stroke-width="{"2.5" if is_core else "1.5"}"/>')

        # Left accent vertical ribbon
        parts.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="6" height="{node.height:.1f}" rx="3" fill="{col}"/>')

        # Core node subtle glow halo
        if is_core:
            parts.append(f'<rect x="{bx-4:.1f}" y="{by-4:.1f}" width="{node.width+8:.1f}" height="{node.height+8:.1f}" rx="16" fill="none" stroke="{col}" stroke-width="1.2" stroke-opacity="0.35" stroke-dasharray="6 6"/>')

        # Role Badge pill
        role_text = node.role.upper()
        role_w = len(role_text) * 7.0 + 16
        rx_pos = bx + node.width - role_w - 12
        parts.append(f'<rect x="{rx_pos:.1f}" y="{by + 12:.1f}" width="{role_w:.1f}" height="18" rx="4" fill="{col}" fill-opacity="0.16"/>')
        parts.append(f'<text x="{rx_pos + role_w/2:.1f}" y="{by + 24:.1f}" text-anchor="middle" font-family="\'Inter\', sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="{col}">{e(role_text)}</text>')

        # Node Status Beacon
        parts.append(f'<circle cx="{bx + 24:.1f}" cy="{by + 21:.1f}" r="4.5" fill="{col}"/>')
        if is_core:
            parts.append(f'<circle cx="{bx + 24:.1f}" cy="{by + 21:.1f}" r="8" fill="none" stroke="{col}" stroke-width="1.5" stroke-opacity="0.5"/>')

        # Node ID tag
        parts.append(f'<text x="{bx + 36:.1f}" y="{by + 24:.1f}" font-family="\'Inter\', monospace" font-size="11" font-weight="600" fill="{text_muted}">{e(node.id)}</text>')

        # Node Primary Label
        label_text = node.label[:26]
        parts.append(f'<text x="{bx + 18:.1f}" y="{by + 52:.1f}" font-family="\'Inter\', \'Segoe UI\', sans-serif" font-size="15" font-weight="700" fill="{text_primary}">{e(label_text)}</text>')

        # Node Description / Subtitle
        desc_text = node.description or f"Operational {node.role.lower()} vertex"
        parts.append(f'<text x="{bx + 18:.1f}" y="{by + 72:.1f}" font-family="\'Libre Franklin\', sans-serif" font-size="12" fill="{text_muted}">{e(desc_text[:32])}</text>')

        parts.append('</g>')

    # 5. Technical Telemetry & Legend Footer
    foot_y = H - 95
    foot_w = W - 2 * margin_l
    parts.append(f'<rect x="{margin_l}" y="{foot_y}" width="{foot_w}" height="55" rx="8" fill="{card_bg}" stroke="{card_border}" stroke-width="1"/>')

    # Legend items
    leg_x = margin_l + 24
    # Item 1: Directional Flow
    parts.append(f'<line x1="{leg_x}" y1="{foot_y + 28}" x2="{leg_x + 30}" y2="{foot_y + 28}" stroke="{accent_pulse}" stroke-width="2.5" marker-end="url(#marker-arrow-flow)"/>')
    parts.append(f'<text x="{leg_x + 42}" y="{foot_y + 32}" font-family="\'Inter\', sans-serif" font-size="12" font-weight="600" fill="{text_primary}">Directional Flow</text>')

    # Item 2: Governance / Policy Constraint
    leg_x += 180
    parts.append(f'<line x1="{leg_x}" y1="{foot_y + 28}" x2="{leg_x + 30}" y2="{foot_y + 28}" stroke="{accent_coral}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#marker-arrow-constraint)"/>')
    parts.append(f'<text x="{leg_x + 42}" y="{foot_y + 32}" font-family="\'Inter\', sans-serif" font-size="12" font-weight="600" fill="{text_primary}">Governance Constraint</text>')

    # Item 3: Core Hub Node
    leg_x += 220
    parts.append(f'<circle cx="{leg_x + 6}" cy="{foot_y + 28}" r="6" fill="{accent_pulse}"/>')
    parts.append(f'<circle cx="{leg_x + 6}" cy="{foot_y + 28}" r="10" fill="none" stroke="{accent_pulse}" stroke-width="1.2" stroke-opacity="0.6"/>')
    parts.append(f'<text x="{leg_x + 26}" y="{foot_y + 32}" font-family="\'Inter\', sans-serif" font-size="12" font-weight="600" fill="{text_primary}">Core Architectural Hub</text>')

    # Right: Source doc or sovereign attribution
    src_doc = str(spec.metadata.get("source_document") or spec.metadata.get("source") or "MCIT AI Sovereign Framework 2026")
    parts.append(f'<text x="{margin_l + foot_w - 20}" y="{foot_y + 32}" text-anchor="end" font-family="\'Inter\', sans-serif" font-size="12" font-weight="600" fill="{text_muted}">{e(src_doc)} · MCIT AI</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        + "".join(parts)
        + "</svg>"
    )
    return svg, H


def render_handwritten_sketch_svg(spec: BlueprintSpec, mode: str = "dark") -> Tuple[str, int]:
    """Render the BlueprintSpec in an authentic hand-drawn / whiteboard / chalkboard sketch style."""
    W = 1600
    H = 1200
    e = lambda s: html.escape(str(s))

    # Apply layout solver
    algo = spec.layout_algorithm.lower()
    if "hierarch" in algo or "dag" in algo or "tree" in algo:
        solve_hierarchical(spec.nodes, spec.edges, W, H)
    elif "circ" in algo or "radial" in algo or "orbit" in algo:
        solve_circular(spec.nodes, spec.edges, W, H)
    elif "grid" in algo or "matrix" in algo:
        solve_grid(spec.nodes, spec.edges, W, H)
    else:
        solve_force_directed_spring(spec.nodes, spec.edges, W, H)

    rng = random.Random(spec.nodes and (len(spec.nodes) * 17 + 42) or 77)

    is_dark = mode == "dark"
    if is_dark:
        # Slate Chalkboard style
        bg = "#141A1C"
        grid_col = "#1E2729"
        ink_primary = "#F8FAFC"
        ink_muted = "#94A3B8"
        card_wash = "#1C2427"
        role_palette = {
            "core": "#38BDF8", "hub": "#38BDF8", "central": "#38BDF8",
            "input": "#4ADE80", "source": "#4ADE80",
            "ai": "#C084FC", "compute": "#C084FC", "model": "#C084FC",
            "storage": "#FCD34D", "data": "#FCD34D", "database": "#FCD34D",
            "governance": "#F87171", "constraint": "#F87171", "policy": "#F87171", "security": "#FB7185",
            "gateway": "#2DD4BF", "api": "#2DD4BF", "output": "#60A5FA",
        }
        flow_col = "#38BDF8"
        constraint_col = "#F87171"
    else:
        # Whiteboard / Architect Sketchpad style
        bg = "#FAF9F5"
        grid_col = "#E7E5E4"
        ink_primary = "#1E293B"
        ink_muted = "#64748B"
        card_wash = "#FFFFFF"
        role_palette = {
            "core": "#0284C7", "hub": "#0284C7", "central": "#0284C7",
            "input": "#059669", "source": "#059669",
            "ai": "#7C3AED", "compute": "#7C3AED", "model": "#7C3AED",
            "storage": "#D97706", "data": "#D97706", "database": "#D97706",
            "governance": "#DC2626", "constraint": "#DC2626", "policy": "#DC2626", "security": "#E11D48",
            "gateway": "#0891B2", "api": "#0891B2", "output": "#2563EB",
        }
        flow_col = "#0284C7"
        constraint_col = "#DC2626"

    font_fam = "'Caveat', 'Kalam', 'Patrick Hand', 'Chalkboard SE', 'Comic Sans MS', cursive, sans-serif"
    node_dict = {n.id: n for n in spec.nodes}
    parts: List[str] = []

    # SVG Defs & Styles
    defs = f"""<defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&amp;family=Patrick+Hand&amp;display=swap');
        .sketch-font {{ font-family: {font_fam}; }}
      </style>
      <pattern id="sketch-grid" width="45" height="45" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="{grid_col}"/>
      </pattern>
    </defs>"""
    parts.append(defs)

    # 1. Background Paper / Chalkboard
    parts.append(f'<rect width="{W}" height="{H}" fill="{bg}"/>')
    parts.append(f'<rect width="{W}" height="{H}" fill="url(#sketch-grid)"/>')

    # 2. Header
    margin_l = 80
    top_y = 55

    # Hand-drawn category pill
    pill_w = 340
    pill_paths = _sketch_box_paths(margin_l, top_y, pill_w, 36, rng, overshoot=3)
    for p in pill_paths[:4]:
        parts.append(f'<path d="{p}" fill="none" stroke="{flow_col}" stroke-width="2.2" stroke-linecap="round"/>')
    parts.append(f'<text x="{margin_l + pill_w / 2}" y="{top_y + 24}" text-anchor="middle" class="sketch-font" font-size="18" font-weight="700" letter-spacing="1.5" fill="{flow_col}">HANDWRITTEN ARCHITECTURAL SKETCH</text>')

    top_y += 62
    title_text = spec.title
    parts.append(f'<text x="{margin_l}" y="{top_y}" class="sketch-font" font-size="46" font-weight="700" fill="{ink_primary}">{e(title_text)}</text>')

    # Hand-drawn wavy double underline
    t_len = min(1100, max(260, len(title_text) * 23))
    parts.append(f'<path d="{_sketch_line(margin_l, top_y + 10, margin_l + t_len, top_y + 9, rng, wobble=2.0, overshoot=5)}" fill="none" stroke="{flow_col}" stroke-width="3" stroke-linecap="round"/>')
    parts.append(f'<path d="{_sketch_line(margin_l + 10, top_y + 18, margin_l + t_len - 14, top_y + 17, rng, wobble=2.2, overshoot=4)}" fill="none" stroke="{flow_col}" stroke-width="2" stroke-opacity="0.6" stroke-linecap="round"/>')

    top_y += 38
    sub_text = spec.subtitle
    parts.append(f'<text x="{margin_l}" y="{top_y}" class="sketch-font" font-size="22" font-weight="600" fill="{ink_muted}">{e(sub_text[:120])}</text>')

    # Top right sticky notes card
    right_x = W - margin_l
    badge_w = 400
    badge_x = right_x - badge_w
    for p in _sketch_box_paths(badge_x, 48, badge_w, 68, rng, overshoot=4):
        parts.append(f'<path d="{p}" fill="none" stroke="{ink_muted}" stroke-width="1.8" stroke-linecap="round"/>')
    parts.append(f'<text x="{badge_x + 18}" y="{74}" class="sketch-font" font-size="16" font-weight="700" fill="{ink_muted}">TOPOLOGY PHYSICS:</text>')
    parts.append(f'<text x="{badge_x + 18}" y="{98}" class="sketch-font" font-size="20" font-weight="700" fill="{flow_col}">{e(spec.layout_algorithm.upper().replace("_", " "))}</text>')
    parts.append(f'<text x="{badge_x + 230}" y="{74}" class="sketch-font" font-size="16" font-weight="700" fill="{ink_muted}">SCALE:</text>')
    parts.append(f'<text x="{badge_x + 230}" y="{98}" class="sketch-font" font-size="20" font-weight="700" fill="{ink_primary}">{len(spec.nodes)} NODES · {len(spec.edges)} FLOWS</text>')

    # 3. Edges (Hand-drawn connectors & arrowheads)
    for edge in spec.edges:
        u = node_dict.get(edge.source)
        v = node_dict.get(edge.target)
        if not u or not v:
            continue

        sx, sy = _clip_line_to_rect(u.x, u.y, v.x, v.y, u.width, u.height)
        tx, ty = _clip_line_to_rect(v.x, v.y, u.x, u.y, v.width, v.height)

        dx = tx - sx
        dy = ty - sy
        dist = math.hypot(dx, dy)

        is_gov = "governance" in edge.style or "constraint" in edge.style
        is_dashed = is_gov or "dashed" in edge.style
        edge_col = edge.color or (constraint_col if is_gov else flow_col)

        # Organic curved control point
        curvature = 0.14 if dist > 180 else 0.08
        mx = (sx + tx) / 2.0 - dy * curvature + rng.uniform(-4, 4)
        my = (sy + ty) / 2.0 + dx * curvature + rng.uniform(-4, 4)

        path_d = f"M {sx:.1f} {sy:.1f} Q {mx:.1f} {my:.1f} {tx:.1f} {ty:.1f}"
        dash_attr = 'stroke-dasharray="8 6"' if is_dashed else ""
        stroke_w = max(2.2, min(4.8, 2.0 + edge.weight * 2.2))

        # Main connector line
        parts.append(f'<path d="{path_d}" fill="none" stroke="{edge_col}" stroke-width="{stroke_w}" stroke-linecap="round" {dash_attr} stroke-opacity="{"0.85" if is_dark else "0.9"}"/>')

        # Hand-drawn arrow head
        for barb in _sketch_arrow_head(tx, ty, mx, my, rng, size=15.0):
            parts.append(f'<path d="{barb}" fill="none" stroke="{edge_col}" stroke-width="{stroke_w}" stroke-linecap="round"/>')

        # Optional edge label in hand-drawn sticky badge
        if edge.label:
            lbl_w = len(edge.label) * 9.5 + 24
            lb_paths = _sketch_box_paths(mx - lbl_w / 2, my - 13, lbl_w, 26, rng, overshoot=2)
            parts.append(f'<rect x="{mx - lbl_w/2:.1f}" y="{my - 13:.1f}" width="{lbl_w:.1f}" height="26" rx="4" fill="{card_wash}" fill-opacity="0.95"/>')
            for bp in lb_paths[:4]:
                parts.append(f'<path d="{bp}" fill="none" stroke="{edge_col}" stroke-width="1.6" stroke-linecap="round"/>')
            parts.append(f'<text x="{mx:.1f}" y="{my + 5:.1f}" text-anchor="middle" class="sketch-font" font-size="16" font-weight="700" fill="{edge_col}">{e(edge.label)}</text>')

    # 4. Nodes (Hand-sketched boxes, highlighter washes, handwritten labels)
    for node in spec.nodes:
        bx = node.x - node.width / 2.0
        by = node.y - node.height / 2.0
        is_core = any(node.role.lower() == c for c in ("core", "hub", "central"))
        col = node.color or role_palette.get(node.role.lower(), flow_col)

        # Soft highlighter marker wash inside
        parts.append(f'<rect x="{bx + 3:.1f}" y="{by + 3:.1f}" width="{node.width - 6:.1f}" height="{node.height - 6:.1f}" rx="6" fill="{col}" fill-opacity="{"0.14" if is_dark else "0.10"}"/>')
        parts.append(f'<rect x="{bx + 3:.1f}" y="{by + 3:.1f}" width="{node.width - 6:.1f}" height="{node.height - 6:.1f}" rx="6" fill="{card_wash}" fill-opacity="{"0.4" if is_dark else "0.75"}"/>')

        # Hand-drawn sketchy border strokes
        box_paths = _sketch_box_paths(bx, by, node.width, node.height, rng, overshoot=5.0)
        # Primary sketch strokes
        stroke_main_w = 2.8 if is_core else 2.2
        for p in box_paths[:4]:
            parts.append(f'<path d="{p}" fill="none" stroke="{col if is_core else ink_primary}" stroke-width="{stroke_main_w}" stroke-linecap="round"/>')
        # Secondary faint sketch strokes for that authentic architect hand-drawn feel
        for p in box_paths[4:]:
            parts.append(f'<path d="{p}" fill="none" stroke="{col if is_core else ink_muted}" stroke-width="1.4" stroke-opacity="0.45" stroke-linecap="round"/>')

        # Core node has a hand-sketched outer aura box
        if is_core:
            for p in _sketch_box_paths(bx - 6, by - 6, node.width + 12, node.height + 12, rng, overshoot=6.0)[:4]:
                parts.append(f'<path d="{p}" fill="none" stroke="{col}" stroke-width="1.6" stroke-opacity="0.5" stroke-dasharray="6 5" stroke-linecap="round"/>')

        # Left thick marker swipe
        parts.append(f'<path d="{_sketch_line(bx + 4, by + 6, bx + 4, by + node.height - 6, rng, wobble=0.8, overshoot=1)}" fill="none" stroke="{col}" stroke-width="6" stroke-linecap="round"/>')

        # Hand-drawn status beacon circle
        parts.append(f'<path d="{_sketch_circle_path(bx + 26, by + 24, 7.0, rng)}" fill="{col}" fill-opacity="0.3" stroke="{col}" stroke-width="2.2"/>')
        if is_core:
            parts.append(f'<path d="{_sketch_circle_path(bx + 26, by + 24, 12.0, rng)}" fill="none" stroke="{col}" stroke-width="1.5" stroke-opacity="0.6"/>')

        # Node ID
        parts.append(f'<text x="{bx + 42:.1f}" y="{by + 28:.1f}" class="sketch-font" font-size="17" font-weight="700" fill="{ink_muted}">{e(node.id)}</text>')

        # Handwritten Role Tag: [ CORE ] or [ AI ]
        role_label = f"[ {node.role.upper()} ]"
        parts.append(f'<text x="{bx + node.width - 16:.1f}" y="{by + 28:.1f}" text-anchor="end" class="sketch-font" font-size="16" font-weight="700" letter-spacing="1" fill="{col}">{e(role_label)}</text>')

        # Primary label (bold handwritten Caveat)
        lbl_text = node.label[:25]
        parts.append(f'<text x="{bx + 20:.1f}" y="{by + 58:.1f}" class="sketch-font" font-size="22" font-weight="700" fill="{ink_primary}">{e(lbl_text)}</text>')

        # Node description
        desc_text = node.description or f"Operational {node.role.lower()} vertex"
        parts.append(f'<text x="{bx + 20:.1f}" y="{by + 79:.1f}" class="sketch-font" font-size="16" font-weight="600" fill="{ink_muted}">{e(desc_text[:30])}</text>')

    # 5. Hand-sketched Footer Legend & Scorecard
    foot_y = H - 95
    foot_w = W - 2 * margin_l
    for p in _sketch_box_paths(margin_l, foot_y, foot_w, 56, rng, overshoot=5)[:4]:
        parts.append(f'<path d="{p}" fill="none" stroke="{ink_muted}" stroke-width="1.8" stroke-linecap="round"/>')

    leg_x = margin_l + 28
    # Legend 1: Directional Flow
    parts.append(f'<path d="{_sketch_line(leg_x, foot_y + 28, leg_x + 36, foot_y + 28, rng, wobble=0.8, overshoot=1)}" fill="none" stroke="{flow_col}" stroke-width="2.6" stroke-linecap="round"/>')
    for barb in _sketch_arrow_head(leg_x + 36, foot_y + 28, leg_x, foot_y + 28, rng, size=12.0):
        parts.append(f'<path d="{barb}" fill="none" stroke="{flow_col}" stroke-width="2.6" stroke-linecap="round"/>')
    parts.append(f'<text x="{leg_x + 48}" y="{foot_y + 34}" class="sketch-font" font-size="18" font-weight="700" fill="{ink_primary}">Directional Flow</text>')

    # Legend 2: Governance Constraint
    leg_x += 200
    parts.append(f'<path d="{_sketch_line(leg_x, foot_y + 28, leg_x + 36, foot_y + 28, rng, wobble=0.8, overshoot=1)}" fill="none" stroke="{constraint_col}" stroke-width="2.4" stroke-dasharray="6 4" stroke-linecap="round"/>')
    for barb in _sketch_arrow_head(leg_x + 36, foot_y + 28, leg_x, foot_y + 28, rng, size=12.0):
        parts.append(f'<path d="{barb}" fill="none" stroke="{constraint_col}" stroke-width="2.4" stroke-linecap="round"/>')
    parts.append(f'<text x="{leg_x + 48}" y="{foot_y + 34}" class="sketch-font" font-size="18" font-weight="700" fill="{ink_primary}">Governance Constraint</text>')

    # Legend 3: Core Hub Node
    leg_x += 230
    parts.append(f'<path d="{_sketch_circle_path(leg_x + 8, foot_y + 28, 8.0, rng)}" fill="{flow_col}" fill-opacity="0.3" stroke="{flow_col}" stroke-width="2"/>')
    parts.append(f'<text x="{leg_x + 28}" y="{foot_y + 34}" class="sketch-font" font-size="18" font-weight="700" fill="{ink_primary}">Core Sovereign Hub</text>')

    # Right: Source doc
    src_doc = str(spec.metadata.get("source_document") or spec.metadata.get("source") or "MCIT AI Sovereign Framework 2026")
    parts.append(f'<text x="{margin_l + foot_w - 20}" y="{foot_y + 34}" text-anchor="end" class="sketch-font" font-size="18" font-weight="700" fill="{ink_muted}">{e(src_doc)} · MCIT AI</text>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        + "".join(parts)
        + "</svg>"
    )
    return svg, H



async def render_blueprint_files(spec: BlueprintSpec, mode: str = "dark") -> Tuple[Dict[str, bytes], int]:
    """Render the blueprint to SVG and convert to PNG & PDF using VectorCraft."""
    from loguru import logger
    from open_notebook.craft.runner import run_cli
    from open_notebook.craft.studio import job_dir

    work = job_dir()
    svg, h = render_blueprint_svg(spec, mode)
    src = work / "blueprint.svg"
    src.write_text(svg, "utf-8")
    png, pdf = work / "blueprint.png", work / "blueprint.pdf"

    try:
        await run_cli("vectorcraft", ["convert", str(src), str(png), "--scale", "1"], cwd=work)
        await run_cli("vectorcraft", ["convert", str(src), str(pdf)], cwd=work)
    except Exception as ex:
        logger.warning(f"VectorCraft CLI conversion exception: {ex}")

    files: Dict[str, bytes] = {"svg": svg.encode("utf-8")}
    if png.exists():
        files["png"] = png.read_bytes()
    if pdf.exists():
        files["pdf"] = pdf.read_bytes()
    return files, h

