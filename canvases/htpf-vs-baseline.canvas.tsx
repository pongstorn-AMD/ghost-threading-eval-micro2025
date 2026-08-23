import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Swatch,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";
import type { Color } from "cursor/canvas";

type DramQuality = "good" | "fair" | "unusable";

type Measurement = {
  workload: string;
  kernel: string;
  /** Kernel-only "Average Time" from the figure6 baseline run, seconds. */
  baseTime: number;
  /** Kernel-only "Average Time" from the figure6_4 htpf run, seconds. */
  htpfTime: number;
  speedup: number;
  /** Same metric from figure6_4's own baseline run — the within-campaign control. */
  ctrlBaseTime: number;
  ctrlSpeedup: number;
  /** Whole-run DRAM traffic (cas_count_read + cas_count_write), GiB. */
  baseDram: number;
  htpfDram: number;
  ctrlBaseDram: number;
  dramRatio: number;
  ctrlDramRatio: number;
  baseRead: number;
  htpfRead: number;
  dramQuality: DramQuality;
};

const ROWS: Measurement[] = [
  { workload: "bc-kron", kernel: "bc", baseTime: 86.857, htpfTime: 80.593, speedup: 1.0777, ctrlBaseTime: 84.005, ctrlSpeedup: 1.0423, baseDram: 333.51, htpfDram: 370.28, ctrlBaseDram: 381.73, dramRatio: 1.1102, ctrlDramRatio: 0.97, baseRead: 8.591, htpfRead: 7.256, dramQuality: "good" },
  { workload: "bc-twitter", kernel: "bc", baseTime: 31.113, htpfTime: 29.825, speedup: 1.0432, ctrlBaseTime: 30.57, ctrlSpeedup: 1.025, baseDram: 180.2, htpfDram: 189.36, ctrlBaseDram: 205.32, dramRatio: 1.0508, ctrlDramRatio: 0.9223, baseRead: 6.727, htpfRead: 5.883, dramQuality: "good" },
  { workload: "bc-urand", kernel: "bc", baseTime: 158.087, htpfTime: 143.136, speedup: 1.1044, ctrlBaseTime: 156.995, ctrlSpeedup: 1.0968, baseDram: 567.16, htpfDram: 644.8, ctrlBaseDram: 642.85, dramRatio: 1.1369, ctrlDramRatio: 1.003, baseRead: 8.711, htpfRead: 7.362, dramQuality: "good" },
  { workload: "bc-road", kernel: "bc", baseTime: 2.06, htpfTime: 2.075, speedup: 0.9927, ctrlBaseTime: 2.009, ctrlSpeedup: 0.9682, baseDram: 9.2, htpfDram: 10.31, ctrlBaseDram: 8.82, dramRatio: 1.1208, ctrlDramRatio: 1.1699, baseRead: 0.55, htpfRead: 0.459, dramQuality: "good" },
  { workload: "bc-web", kernel: "bc", baseTime: 10.569, htpfTime: 10.82, speedup: 0.9768, ctrlBaseTime: 9.173, ctrlSpeedup: 0.8478, baseDram: 82.94, htpfDram: 91.67, ctrlBaseDram: 88.03, dramRatio: 1.1052, ctrlDramRatio: 1.0414, baseRead: 8.41, htpfRead: 7.432, dramQuality: "good" },
  { workload: "bfs-kron", kernel: "bfs", baseTime: 4.158, htpfTime: 3.07, speedup: 1.3544, ctrlBaseTime: 3.85, ctrlSpeedup: 1.2544, baseDram: 74.43, htpfDram: 74.13, ctrlBaseDram: 75.17, dramRatio: 0.996, ctrlDramRatio: 0.9862, baseRead: 8.577, htpfRead: 7.098, dramQuality: "fair" },
  { workload: "bfs-twitter", kernel: "bfs", baseTime: 2.736, htpfTime: 1.752, speedup: 1.5614, ctrlBaseTime: 2.417, ctrlSpeedup: 1.3795, baseDram: 50.82, htpfDram: 51.7, ctrlBaseDram: 52.04, dramRatio: 1.0172, ctrlDramRatio: 0.9934, baseRead: 6.721, htpfRead: 5.77, dramQuality: "fair" },
  { workload: "bfs-urand", kernel: "bfs", baseTime: 11.134, htpfTime: 7.522, speedup: 1.4803, ctrlBaseTime: 9.64, ctrlSpeedup: 1.2816, baseDram: 83.7, htpfDram: 83.92, ctrlBaseDram: 84.19, dramRatio: 1.0026, ctrlDramRatio: 0.9968, baseRead: 8.713, htpfRead: 7.201, dramQuality: "fair" },
  { workload: "bfs-road", kernel: "bfs", baseTime: 0.999, htpfTime: 1.159, speedup: 0.8619, ctrlBaseTime: 0.917, ctrlSpeedup: 0.7912, baseDram: 5.57, htpfDram: 6.0, ctrlBaseDram: 5.65, dramRatio: 1.0773, ctrlDramRatio: 1.0623, baseRead: 0.549, htpfRead: 0.414, dramQuality: "fair" },
  { workload: "bfs-web", kernel: "bfs", baseTime: 6.671, htpfTime: 3.998, speedup: 1.6686, ctrlBaseTime: 4.523, ctrlSpeedup: 1.1312, baseDram: 71.26, htpfDram: 72.84, ctrlBaseDram: 72.57, dramRatio: 1.0222, ctrlDramRatio: 1.0037, baseRead: 8.412, htpfRead: 7.33, dramQuality: "fair" },
  { workload: "cc-kron", kernel: "cc", baseTime: 8.006, htpfTime: 6.601, speedup: 1.2128, ctrlBaseTime: 7.646, ctrlSpeedup: 1.1583, baseDram: 77.08, htpfDram: 80.81, ctrlBaseDram: 109.85, dramRatio: 1.0484, ctrlDramRatio: 0.7356, baseRead: 8.587, htpfRead: 7.226, dramQuality: "fair" },
  { workload: "cc-twitter", kernel: "cc", baseTime: 2.79, htpfTime: 2.28, speedup: 1.2234, ctrlBaseTime: 2.511, ctrlSpeedup: 1.1015, baseDram: 51.11, htpfDram: 52.71, ctrlBaseDram: 52.66, dramRatio: 1.0313, ctrlDramRatio: 1.0009, baseRead: 6.723, htpfRead: 5.888, dramQuality: "fair" },
  { workload: "cc-urand", kernel: "cc", baseTime: 24.682, htpfTime: 17.582, speedup: 1.4038, ctrlBaseTime: 23.592, ctrlSpeedup: 1.3418, baseDram: 99.5, htpfDram: 99.42, ctrlBaseDram: 129.13, dramRatio: 0.9991, ctrlDramRatio: 0.7699, baseRead: 8.71, htpfRead: 7.353, dramQuality: "good" },
  { workload: "cc-road", kernel: "cc", baseTime: 0.698, htpfTime: 0.638, speedup: 1.0935, ctrlBaseTime: 0.616, ctrlSpeedup: 0.9659, baseDram: 5.55, htpfDram: 5.95, ctrlBaseDram: 7.19, dramRatio: 1.0717, ctrlDramRatio: 0.8263, baseRead: 0.544, htpfRead: 0.461, dramQuality: "fair" },
  { workload: "cc-web", kernel: "cc", baseTime: 2.371, htpfTime: 1.655, speedup: 1.4324, ctrlBaseTime: 1.981, ctrlSpeedup: 1.197, baseDram: 64.41, htpfDram: 63.16, ctrlBaseDram: 91.29, dramRatio: 0.9807, ctrlDramRatio: 0.6919, baseRead: 8.416, htpfRead: 7.435, dramQuality: "fair" },
  { workload: "pr-kron", kernel: "pr", baseTime: 151.809, htpfTime: 209.745, speedup: 0.7238, ctrlBaseTime: 150.017, ctrlSpeedup: 0.7152, baseDram: 624.42, htpfDram: 626.45, ctrlBaseDram: 619.87, dramRatio: 1.0032, ctrlDramRatio: 1.0106, baseRead: 8.56, htpfRead: 7.32, dramQuality: "good" },
  { workload: "pr-twitter", kernel: "pr", baseTime: 129.695, htpfTime: 186.964, speedup: 0.6937, ctrlBaseTime: 126.997, ctrlSpeedup: 0.6793, baseDram: 430.3, htpfDram: 436.05, ctrlBaseDram: 428.1, dramRatio: 1.0133, ctrlDramRatio: 1.0186, baseRead: 6.74, htpfRead: 5.915, dramQuality: "good" },
  { workload: "pr-urand", kernel: "pr", baseTime: 191.037, htpfTime: 237.642, speedup: 0.8039, ctrlBaseTime: 190.546, ctrlSpeedup: 0.8018, baseDram: 981.62, htpfDram: 986.72, ctrlBaseDram: 982.14, dramRatio: 1.0052, ctrlDramRatio: 1.0047, baseRead: 8.684, htpfRead: 7.45, dramQuality: "good" },
  { workload: "pr-road", kernel: "pr", baseTime: 3.445, htpfTime: 4.141, speedup: 0.8321, ctrlBaseTime: 3.137, ctrlSpeedup: 0.7575, baseDram: 22.71, htpfDram: 22.38, ctrlBaseDram: 22.69, dramRatio: 0.9855, ctrlDramRatio: 0.9866, baseRead: 0.554, htpfRead: 0.47, dramQuality: "good" },
  { workload: "pr-web", kernel: "pr", baseTime: 44.77, htpfTime: 37.156, speedup: 1.2049, ctrlBaseTime: 31.551, ctrlSpeedup: 0.8492, baseDram: 218.89, htpfDram: 238.99, ctrlBaseDram: 218.57, dramRatio: 1.0918, ctrlDramRatio: 1.0934, baseRead: 8.356, htpfRead: 7.488, dramQuality: "good" },
  { workload: "sssp-kron", kernel: "sssp", baseTime: 56.911, htpfTime: 50.73, speedup: 1.1218, ctrlBaseTime: 55.847, ctrlSpeedup: 1.1009, baseDram: 342.18, htpfDram: 307.06, ctrlBaseDram: 368.03, dramRatio: 0.8974, ctrlDramRatio: 0.8343, baseRead: 265.351, htpfRead: 13.867, dramQuality: "unusable" },
  { workload: "sssp-twitter", kernel: "sssp", baseTime: 20.12, htpfTime: 17.888, speedup: 1.1248, ctrlBaseTime: 20.056, ctrlSpeedup: 1.1212, baseDram: 146.68, htpfDram: 156.34, ctrlBaseDram: 165.4, dramRatio: 1.0659, ctrlDramRatio: 0.9452, baseRead: 12.667, htpfRead: 11.212, dramQuality: "good" },
  { workload: "sssp-urand", kernel: "sssp", baseTime: 119.425, htpfTime: 94.395, speedup: 1.2652, ctrlBaseTime: 119.117, ctrlSpeedup: 1.2619, baseDram: 546.89, htpfDram: 514.04, ctrlBaseDram: 566.76, dramRatio: 0.9399, ctrlDramRatio: 0.907, baseRead: 269.745, htpfRead: 14.01, dramQuality: "unusable" },
  { workload: "sssp-web", kernel: "sssp", baseTime: 19.07, htpfTime: 12.915, speedup: 1.4766, ctrlBaseTime: 18.75, ctrlSpeedup: 1.4518, baseDram: 196.39, htpfDram: 164.03, ctrlBaseDram: 210.19, dramRatio: 0.8352, ctrlDramRatio: 0.7804, baseRead: 236.654, htpfRead: 14.403, dramQuality: "unusable" },
  { workload: "tc-urand", kernel: "tc", baseTime: 570.342, htpfTime: 306.493, speedup: 1.8609, ctrlBaseTime: 575.686, ctrlSpeedup: 1.8783, baseDram: 918.16, htpfDram: 1349.82, ctrlBaseDram: 1816.36, dramRatio: 1.4701, ctrlDramRatio: 0.7431, baseRead: 8.667, htpfRead: 7.426, dramQuality: "good" },
];

const KERNELS = ["bc", "bfs", "cc", "pr", "sssp", "tc"] as const;

const KERNEL_COLOR: Record<(typeof KERNELS)[number], Color> = {
  bc: "blue",
  bfs: "green",
  cc: "cyan",
  pr: "red",
  sssp: "purple",
  tc: "orange",
};

function geomean(values: number[]): number {
  const usable = values.filter((v) => v > 0);
  if (usable.length === 0) return Number.NaN;
  return Math.exp(
    usable.reduce((acc, v) => acc + Math.log(v), 0) / usable.length,
  );
}

function fmt(value: number, digits = 2): string {
  return value.toFixed(digits);
}

type ScatterPoint = {
  workload: string;
  kernel: string;
  x: number;
  y: number;
  quality: DramQuality;
};

function DramSpeedupScatter({
  points,
  xLabel,
  yLabel,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
}) {
  const theme = useHostTheme();
  const [hovered, setHovered] = useCanvasState<string | null>(
    "scatterHover",
    null,
  );

  const width = 720;
  const height = 440;
  const pad = { top: 24, right: 24, bottom: 52, left: 56 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const geoX = geomean(xs);
  const geoY = geomean(ys);
  const xMin = Math.min(0.7, ...xs) - 0.02;
  const xMax = Math.max(1.55, ...xs) + 0.02;
  const yMin = Math.min(0.6, ...ys) - 0.03;
  const yMax = Math.max(2.0, ...ys) + 0.03;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = [0.8, 1.0, 1.2, 1.4];
  const yTicks = [0.7, 1.0, 1.3, 1.6, 1.9];

  const active = points.find((p) => p.workload === hovered) ?? null;
  const geoCx = sx(geoX);
  const geoCy = sy(geoY);
  const geoR = 8;

  return (
    <Stack gap={10}>
      <Row gap={12} align="center" wrap>
        {KERNELS.map((k) => (
          <span
            key={k}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Swatch color={KERNEL_COLOR[k]} />
            <Text size="small" as="span">
              {k}
            </Text>
          </span>
        ))}
        <Text size="small" tone="tertiary">
          ◆ = geometric mean
        </Text>
      </Row>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", maxWidth: width }}
        onMouseLeave={() => setHovered(null)}
      >
        <rect
          x={pad.left}
          y={pad.top}
          width={plotW}
          height={plotH}
          fill={theme.fill.quaternary}
          stroke={theme.stroke.tertiary}
        />

        {/* Parity crosshair at (1, 1) */}
        <line
          x1={sx(1)}
          y1={pad.top}
          x2={sx(1)}
          y2={pad.top + plotH}
          stroke={theme.stroke.secondary}
          strokeDasharray="4 4"
        />
        <line
          x1={pad.left}
          y1={sy(1)}
          x2={pad.left + plotW}
          y2={sy(1)}
          stroke={theme.stroke.secondary}
          strokeDasharray="4 4"
        />
        <text
          x={sx(1) + 4}
          y={pad.top + 12}
          fill={theme.text.tertiary}
          fontSize={10}
        >
          DRAM parity
        </text>
        <text
          x={pad.left + plotW - 4}
          y={sy(1) - 4}
          fill={theme.text.tertiary}
          fontSize={10}
          textAnchor="end"
        >
          speedup parity
        </text>

        {xTicks.map((t) => (
          <g key={`x-${t}`}>
            <line
              x1={sx(t)}
              y1={pad.top + plotH}
              x2={sx(t)}
              y2={pad.top + plotH + 4}
              stroke={theme.stroke.secondary}
            />
            <text
              x={sx(t)}
              y={pad.top + plotH + 18}
              fill={theme.text.tertiary}
              fontSize={11}
              textAnchor="middle"
            >
              {t.toFixed(1)}x
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y-${t}`}>
            <line
              x1={pad.left - 4}
              y1={sy(t)}
              x2={pad.left}
              y2={sy(t)}
              stroke={theme.stroke.secondary}
            />
            <text
              x={pad.left - 8}
              y={sy(t) + 4}
              fill={theme.text.tertiary}
              fontSize={11}
              textAnchor="end"
            >
              {t.toFixed(1)}x
            </text>
          </g>
        ))}

        <text
          x={pad.left + plotW / 2}
          y={height - 8}
          fill={theme.text.secondary}
          fontSize={12}
          textAnchor="middle"
        >
          {xLabel}
        </text>
        <text
          x={16}
          y={pad.top + plotH / 2}
          fill={theme.text.secondary}
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90 16 ${pad.top + plotH / 2})`}
        >
          {yLabel}
        </text>

        {points.map((p) => {
          const color =
            theme.category[KERNEL_COLOR[p.kernel as (typeof KERNELS)[number]]];
          const isHover = hovered === p.workload;
          const hollow = p.quality === "unusable";
          return (
            <g
              key={p.workload}
              onMouseEnter={() => setHovered(p.workload)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={isHover ? 7 : 5.5}
                fill={hollow ? "transparent" : color}
                stroke={color}
                strokeWidth={hollow || isHover ? 2 : 1}
                opacity={hovered && !isHover ? 0.35 : 1}
              />
              {isHover ? (
                <text
                  x={sx(p.x) + 10}
                  y={sy(p.y) - 10}
                  fill={theme.text.primary}
                  fontSize={11}
                  fontWeight={590}
                >
                  {p.workload} · speedup {fmt(p.y)}x · DRAM {fmt(p.x)}x
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Geometric mean of DRAM ratio (x) and speedup (y) */}
        <polygon
          points={`${geoCx},${geoCy - geoR} ${geoCx + geoR},${geoCy} ${geoCx},${geoCy + geoR} ${geoCx - geoR},${geoCy}`}
          fill={theme.accent.primary}
          stroke={theme.text.primary}
          strokeWidth={1.5}
        />
        <text
          x={geoCx + geoR + 6}
          y={geoCy - 6}
          fill={theme.text.primary}
          fontSize={11}
          fontWeight={590}
        >
          geomean
        </text>
        <text
          x={geoCx + geoR + 6}
          y={geoCy + 8}
          fill={theme.text.secondary}
          fontSize={10}
        >
          speedup {fmt(geoY)}x · DRAM {fmt(geoX)}x
        </text>
      </svg>
      {active ? (
        <Text size="small" tone="secondary">
          `{active.workload}` — speedup {fmt(active.y)}x, DRAM ratio{" "}
          {fmt(active.x)}x
          {active.quality === "unusable"
            ? " (DRAM contaminated by unequal graph read-in)"
            : ""}
        </Text>
      ) : (
        <Text size="small" tone="tertiary">
          Geomean (n={points.length}): speedup {fmt(geoY)}x, DRAM ratio{" "}
          {fmt(geoX)}x. Hover a point to inspect. Quadrants relative to (1, 1):
          upper-left = faster with less DRAM; upper-right = faster with more
          DRAM; lower-left = slower with less DRAM; lower-right = slower with
          more DRAM.
        </Text>
      )}
    </Stack>
  );
}

export default function HtpfVsBaseline() {
  const [refBase, setRefBase] = useCanvasState<"fig6" | "fig64">(
    "referenceBaseline",
    "fig6",
  );

  const usingFig6 = refBase === "fig6";
  const refLabel = usingFig6
    ? "figure6 baseline"
    : "figure6_4 baseline (same-campaign control)";

  const speedupOf = (r: Measurement) => (usingFig6 ? r.speedup : r.ctrlSpeedup);
  const dramRatioOf = (r: Measurement) =>
    usingFig6 ? r.dramRatio : r.ctrlDramRatio;
  const baseDramOf = (r: Measurement) =>
    usingFig6 ? r.baseDram : r.ctrlBaseDram;

  const unusable = ROWS.filter((r) => r.dramQuality === "unusable");
  const usable = ROWS.filter((r) => r.dramQuality !== "unusable");

  const speedSorted = [...usable].sort((a, b) => speedupOf(b) - speedupOf(a));

  const geoSpeedup = geomean(usable.map(speedupOf));
  const wins = usable.filter((r) => speedupOf(r) > 1).length;
  const losses = usable.length - wins;

  const dramSorted = [...usable].sort(
    (a, b) => dramRatioOf(b) - dramRatioOf(a),
  );
  const geoDram = geomean(usable.map(dramRatioOf));

  const dramBySize = [...usable].sort(
    (a, b) => baseDramOf(b) - baseDramOf(a),
  );

  const perKernel = KERNELS.map((k) => {
    const group = usable.filter((r) => r.kernel === k);
    return {
      kernel: k,
      count: group.length,
      fig6: geomean(group.map((r) => r.speedup)),
      fig64: geomean(group.map((r) => r.ctrlSpeedup)),
      dram: geomean(group.map((r) => r.dramRatio)),
    };
  }).filter((k) => k.count > 0);

  const best = speedSorted[0];
  const worst = speedSorted[speedSorted.length - 1];

  const scatterPoints: ScatterPoint[] = usable.map((r) => ({
    workload: r.workload,
    kernel: r.kernel,
    x: dramRatioOf(r),
    y: speedupOf(r),
    quality: r.dramQuality,
  }));

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={6}>
        <H1>Ghost Threading (htpf) vs baseline — GAP suite</H1>
        <Text tone="secondary">
          htpf from `gap/output/figure6_4`, baseline from `gap/output/figure6`.
          Plots and stats use {usable.length} of {ROWS.length} kernel/graph
          pairs after dropping DRAM-unusable runs. Speedup is baseline kernel
          time divided by htpf kernel time (GAP `Average Time`). DRAM traffic
          is summed `uncore_imc_*` CAS read+write counters across all 8
          channels.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat
          value={`${fmt(geoSpeedup)}x`}
          label={`Geomean speedup vs ${usingFig6 ? "figure6" : "figure6_4"} baseline`}
          tone={geoSpeedup > 1 ? "success" : "danger"}
        />
        <Stat
          value={`${wins} / ${losses}`}
          label="Workloads faster / slower"
        />
        <Stat
          value={`${fmt(geoDram)}x`}
          label="Geomean DRAM traffic ratio"
          tone={geoDram > 1.02 ? "warning" : "success"}
        />
        <Stat value={`${usable.length}`} label="Workloads plotted" />
      </Grid>

      <Callout tone="warning" title="Omitted (unusable DRAM)">
        Excluded from all plots and geomeans because graph read-in time differed
        too much between the two runs for a whole-process DRAM comparison:{" "}
        {unusable.map((r) => `\`${r.workload}\``).join(", ")}.
      </Callout>

      <Callout tone="warning" title="The two directories are not the same campaign">
        `figure6_4`'s own baseline runs are faster than `figure6`'s — geomean
        0.92x the kernel time, up to 32% faster on `bfs-web`. Comparing htpf in
        `figure6_4` against the baseline in `figure6` therefore folds that drift
        into the result: among usable workloads the speedup is{" "}
        {fmt(geomean(usable.map((r) => r.speedup)))}x across directories but only{" "}
        {fmt(geomean(usable.map((r) => r.ctrlSpeedup)))}x against `figure6_4`'s
        own baseline. Roughly half the apparent gain is environment, not htpf.
        Use the toggle below to switch reference.
      </Callout>

      <Row gap={8} align="center" wrap>
        <Text size="small" tone="tertiary">
          Baseline reference
        </Text>
        <Pill active={usingFig6} onClick={() => setRefBase("fig6")}>
          figure6 (as requested)
        </Pill>
        <Pill active={!usingFig6} onClick={() => setRefBase("fig64")}>
          figure6_4 (control)
        </Pill>
      </Row>

      <Stack gap={8}>
        <H2>DRAM traffic ratio vs speedup</H2>
        <Text size="small" tone="tertiary">
          Each point is one kernel/graph pair. X = htpf DRAM traffic / baseline
          DRAM traffic; Y = baseline kernel time / htpf kernel time. Colored by
          kernel. Reference: {refLabel}.
        </Text>
        <DramSpeedupScatter
          points={scatterPoints}
          xLabel="DRAM traffic ratio (htpf / baseline)"
          yLabel="Speedup (baseline / htpf)"
        />
        <Text size="small" tone="tertiary">
          There is no clean tradeoff: `pr` clusters near DRAM parity but below
          1.0x speedup, while `bfs`/`cc` gains sit near DRAM parity. The
          outlier in the upper-right against figure6 is `tc-urand` (1.86x
          speedup, 1.47x DRAM); against figure6_4's own baseline that same
          point flips left of parity on DRAM.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Speedup by workload</H2>
        <Text size="small" tone="tertiary">
          Kernel-time speedup (baseline / htpf), higher is better. Dashed line
          marks parity at 1.0x. Reference: {refLabel}. Axis starts at 0.6x to
          make the spread visible.
        </Text>
        <BarChart
          categories={speedSorted.map((r) => r.workload)}
          series={[
            {
              name: `Speedup vs ${usingFig6 ? "figure6" : "figure6_4"} baseline`,
              data: speedSorted.map((r) => Number(speedupOf(r).toFixed(3))),
              tone: "info",
            },
          ]}
          horizontal
          height={speedSorted.length * 26 + 60}
          valueSuffix="x"
          showValues
          beginAtZero={false}
          yMin={0.6}
          yMax={2.0}
          referenceLines={[{ value: 1.0, label: "parity", tone: "neutral" }]}
        />
        <Text size="small" tone="tertiary">
          Best: `{best.workload}` at {fmt(speedupOf(best))}x. Worst: `
          {worst.workload}` at {fmt(speedupOf(worst))}x. Source:
          gap/output/figure6_4 vs gap/output/figure6.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Speedup aggregated per kernel</H2>
        <Text size="small" tone="tertiary">
          Geometric mean kernel-time speedup per GAP kernel, under both baseline
          references. The gap between the two bars is campaign drift, not htpf.
        </Text>
        <BarChart
          categories={perKernel.map((k) => `${k.kernel} (n=${k.count})`)}
          series={[
            {
              name: "vs figure6 baseline",
              data: perKernel.map((k) => Number(k.fig6.toFixed(3))),
              tone: "info",
            },
            {
              name: "vs figure6_4 baseline (control)",
              data: perKernel.map((k) => Number(k.fig64.toFixed(3))),
              tone: "neutral",
            },
          ]}
          height={280}
          valueSuffix="x"
          showValues
          beginAtZero={false}
          yMin={0.6}
          yMax={2.0}
          referenceLines={[{ value: 1.0, label: "parity", tone: "neutral" }]}
        />
        <Text size="small" tone="tertiary">
          `pr` is the clear regression: htpf runs at 0.69–0.83x on every `pr`
          graph except `pr-web`. `tc`, `bfs`, and `cc` carry the gains, though
          `bfs-road` is itself a 0.86x loss — the `road` graph regresses under
          every kernel except `cc`.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>DRAM traffic ratio by workload</H2>
        <Text size="small" tone="tertiary">
          htpf DRAM traffic divided by baseline DRAM traffic (total CAS
          read+write bytes, whole process). Below 1.0 means htpf moved less data.
          Reference: {refLabel}.
        </Text>
        <BarChart
          categories={dramSorted.map((r) => r.workload)}
          series={[
            {
              name: "htpf DRAM traffic / baseline DRAM traffic",
              data: dramSorted.map((r) => Number(dramRatioOf(r).toFixed(3))),
              tone: "warning",
            },
          ]}
          horizontal
          height={dramSorted.length * 26 + 60}
          valueSuffix="x"
          showValues
          beginAtZero={false}
          yMin={0.6}
          yMax={1.55}
          referenceLines={[{ value: 1.0, label: "parity", tone: "neutral" }]}
        />
        <Text size="small" tone="tertiary">
          Across the {usable.length} usable workloads the geomean ratio is{" "}
          {fmt(geoDram)}x against the current baseline reference. The sign of
          the DRAM conclusion still depends on which baseline you pick, so treat
          the DRAM direction as unresolved by this data.
        </Text>
      </Stack>

      <Card collapsible defaultOpen={false}>
        <CardHeader trailing="GiB, absolute">
          Absolute DRAM traffic per workload
        </CardHeader>
        <CardBody>
          <Stack gap={8}>
            <Text size="small" tone="tertiary">
              Total DRAM bytes moved per run, sorted by baseline footprint.
              Includes graph read-in as well as the kernel, so short kernels are
              dominated by load time. Reference: {refLabel}.
            </Text>
            <BarChart
              categories={dramBySize.map((r) => r.workload)}
              series={[
                {
                  name: "Baseline DRAM traffic (GiB)",
                  data: dramBySize.map((r) => Number(baseDramOf(r).toFixed(1))),
                  tone: "neutral",
                },
                {
                  name: "htpf DRAM traffic (GiB)",
                  data: dramBySize.map((r) => Number(r.htpfDram.toFixed(1))),
                  tone: "info",
                },
              ]}
              horizontal
              height={dramBySize.length * 42 + 60}
              valueSuffix=" GiB"
              showValues={false}
            />
          </Stack>
        </CardBody>
      </Card>

      <Divider />

      <Stack gap={8}>
        <H2>Full measurements</H2>
        <Text size="small" tone="tertiary">
          Times are GAP `Average Time` in seconds (kernel only). DRAM is total
          CAS read+write in GiB (whole run). Unusable-DRAM workloads are omitted
          (listed above). Dot marks whether htpf beat the figure6 baseline.
        </Text>
        <Table
          headers={[
            "Workload",
            "Base time (s)",
            "htpf time (s)",
            "Speedup",
            "Ctrl speedup",
            "Base DRAM (GiB)",
            "htpf DRAM (GiB)",
            "DRAM ratio",
            "DRAM validity",
          ]}
          columnAlign={[
            "left",
            "right",
            "right",
            "right",
            "right",
            "right",
            "right",
            "right",
            "left",
          ]}
          rowTone={speedSorted.map((r) =>
            r.speedup > 1 ? "success" : "danger",
          )}
          rows={speedSorted.map((r) => [
            r.workload,
            fmt(r.baseTime),
            fmt(r.htpfTime),
            `${fmt(r.speedup)}x`,
            `${fmt(r.ctrlSpeedup)}x`,
            fmt(r.baseDram, 1),
            fmt(r.htpfDram, 1),
            `${fmt(r.dramRatio)}x`,
            r.dramQuality,
          ])}
          striped
          stickyHeader
        />
      </Stack>

      <Divider />

      <Stack gap={10}>
        <H2>Omitted workloads (unusable DRAM)</H2>
        <Text tone="secondary">
          `perf stat` counted DRAM over the whole process (graph read-in +
          kernel). These pairs had unequal read-in times large enough to
          contaminate the DRAM ratio, so they are excluded from every plot and
          geomean above:
        </Text>
        <Table
          headers={[
            "Workload",
            "Baseline read (s)",
            "htpf read (s)",
            "Kernel time (s)",
            "Reported DRAM ratio",
          ]}
          columnAlign={["left", "right", "right", "right", "right"]}
          rows={unusable.map((r) => [
            r.workload,
            fmt(r.baseRead, 1),
            fmt(r.htpfRead, 1),
            fmt(r.htpfTime, 1),
            `${fmt(r.dramRatio)}x`,
          ])}
        />
        <Text size="small" tone="tertiary">
          On `sssp-kron` the baseline spent 265 s in read-in versus 14 s for
          htpf, against a kernel of only ~51 s — so its DRAM ratio says almost
          nothing about the kernel.
        </Text>

        <H3>What is solid and what is not</H3>
        <Text tone="secondary">
          Solid: the shape of the result among usable workloads. `pr` regresses
          on every graph but `pr-web` (0.69–0.83x), the `road` graph regresses
          under `bc`, `bfs`, and `pr`, and large gains land on `tc-urand`
          (1.86x), `bfs-web` (1.67x), `bfs-twitter` (1.56x), and `bfs-urand`
          (1.48x). Not solid: the magnitude of the geomean speedup across
          baseline references, and the direction of the DRAM change. To settle
          both, rerun htpf against a baseline collected in the same campaign and
          scope DRAM counters to the kernel region.
        </Text>
      </Stack>
    </Stack>
  );
}
