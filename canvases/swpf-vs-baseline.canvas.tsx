import {
  Callout,
  Divider,
  Grid,
  H1,
  H2,
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
  /** Kernel-only Average Time from figure6 baseline, seconds. */
  baseTime: number;
  /** Kernel-only Average Time from figure6_4 swpf, seconds. */
  swpfTime: number;
  speedup: number;
  /** Whole-run DRAM traffic (CAS read+write), GiB. */
  baseDram: number;
  swpfDram: number;
  dramRatio: number;
  baseRead: number;
  swpfRead: number;
  dramQuality: DramQuality;
};

/** swpf from gap/output/figure6_4 vs baseline from gap/output/figure6. */
const ROWS: Measurement[] = [
  { workload: "bc-kron", kernel: "bc", baseTime: 86.857, swpfTime: 96.125, speedup: 0.9036, baseDram: 333.51, swpfDram: 441.42, dramRatio: 1.3235, baseRead: 8.591, swpfRead: 7.262, dramQuality: "good" },
  { workload: "bc-twitter", kernel: "bc", baseTime: 31.113, swpfTime: 33.313, speedup: 0.9339, baseDram: 180.2, swpfDram: 227.85, dramRatio: 1.2644, baseRead: 6.727, swpfRead: 5.89, dramQuality: "good" },
  { workload: "bc-urand", kernel: "bc", baseTime: 158.087, swpfTime: 165.209, speedup: 0.9569, baseDram: 567.16, swpfDram: 638.11, dramRatio: 1.1251, baseRead: 8.711, swpfRead: 7.377, dramQuality: "good" },
  { workload: "bc-road", kernel: "bc", baseTime: 2.06, swpfTime: 2.035, speedup: 1.0125, baseDram: 9.2, swpfDram: 9.05, dramRatio: 0.9833, baseRead: 0.55, swpfRead: 0.46, dramQuality: "good" },
  { workload: "bc-web", kernel: "bc", baseTime: 10.569, swpfTime: 10.272, speedup: 1.029, baseDram: 82.94, swpfDram: 92.85, dramRatio: 1.1195, baseRead: 8.41, swpfRead: 7.426, dramQuality: "good" },
  { workload: "bfs-kron", kernel: "bfs", baseTime: 4.158, swpfTime: 3.657, speedup: 1.1369, baseDram: 74.43, swpfDram: 74.68, dramRatio: 1.0033, baseRead: 8.577, swpfRead: 7.258, dramQuality: "fair" },
  { workload: "bfs-twitter", kernel: "bfs", baseTime: 2.736, swpfTime: 2.434, speedup: 1.1242, baseDram: 50.82, swpfDram: 52.05, dramRatio: 1.0242, baseRead: 6.721, swpfRead: 5.88, dramQuality: "fair" },
  { workload: "bfs-urand", kernel: "bfs", baseTime: 11.134, swpfTime: 9.95, speedup: 1.119, baseDram: 83.7, swpfDram: 84.15, dramRatio: 1.0054, baseRead: 8.713, swpfRead: 7.371, dramQuality: "fair" },
  { workload: "bfs-road", kernel: "bfs", baseTime: 0.999, swpfTime: 0.954, speedup: 1.0464, baseDram: 5.57, swpfDram: 5.61, dramRatio: 1.0066, baseRead: 0.549, swpfRead: 0.462, dramQuality: "good" },
  { workload: "bfs-web", kernel: "bfs", baseTime: 6.671, swpfTime: 5.15, speedup: 1.2953, baseDram: 71.26, swpfDram: 72.75, dramRatio: 1.0209, baseRead: 8.412, swpfRead: 7.431, dramQuality: "fair" },
  { workload: "cc-kron", kernel: "cc", baseTime: 8.006, swpfTime: 7.811, speedup: 1.025, baseDram: 77.08, swpfDram: 83.31, dramRatio: 1.0809, baseRead: 8.587, swpfRead: 7.26, dramQuality: "fair" },
  { workload: "cc-twitter", kernel: "cc", baseTime: 2.79, swpfTime: 2.589, speedup: 1.0776, baseDram: 51.11, swpfDram: 53.16, dramRatio: 1.0403, baseRead: 6.723, swpfRead: 5.893, dramQuality: "fair" },
  { workload: "cc-urand", kernel: "cc", baseTime: 24.682, swpfTime: 22.72, speedup: 1.0864, baseDram: 99.5, swpfDram: 99.99, dramRatio: 1.0049, baseRead: 8.71, swpfRead: 7.372, dramQuality: "good" },
  { workload: "cc-road", kernel: "cc", baseTime: 0.698, swpfTime: 0.616, speedup: 1.1322, baseDram: 5.55, swpfDram: 5.68, dramRatio: 1.0248, baseRead: 0.544, swpfRead: 0.46, dramQuality: "fair" },
  { workload: "cc-web", kernel: "cc", baseTime: 2.371, swpfTime: 2.148, speedup: 1.1038, baseDram: 64.41, swpfDram: 67.75, dramRatio: 1.0518, baseRead: 8.416, swpfRead: 7.431, dramQuality: "fair" },
  { workload: "pr-kron", kernel: "pr", baseTime: 151.809, swpfTime: 149.489, speedup: 1.0155, baseDram: 624.42, swpfDram: 622.15, dramRatio: 0.9964, baseRead: 8.56, swpfRead: 7.35, dramQuality: "good" },
  { workload: "pr-twitter", kernel: "pr", baseTime: 129.695, swpfTime: 128.808, speedup: 1.0069, baseDram: 430.3, swpfDram: 432.26, dramRatio: 1.0045, baseRead: 6.74, swpfRead: 5.921, dramQuality: "good" },
  { workload: "pr-urand", kernel: "pr", baseTime: 191.037, swpfTime: 189.627, speedup: 1.0074, baseDram: 981.62, swpfDram: 981.92, dramRatio: 1.0003, baseRead: 8.684, swpfRead: 7.452, dramQuality: "good" },
  { workload: "pr-road", kernel: "pr", baseTime: 3.445, swpfTime: 3.471, speedup: 0.9926, baseDram: 22.71, swpfDram: 22.76, dramRatio: 1.002, baseRead: 0.554, swpfRead: 0.469, dramQuality: "good" },
  { workload: "pr-web", kernel: "pr", baseTime: 44.77, swpfTime: 35.754, speedup: 1.2522, baseDram: 218.89, swpfDram: 219.0, dramRatio: 1.0005, baseRead: 8.356, swpfRead: 7.488, dramQuality: "good" },
  { workload: "sssp-kron", kernel: "sssp", baseTime: 56.911, swpfTime: 49.334, speedup: 1.1536, baseDram: 342.18, swpfDram: 313.44, dramRatio: 0.916, baseRead: 265.351, swpfRead: 13.876, dramQuality: "unusable" },
  { workload: "sssp-twitter", kernel: "sssp", baseTime: 20.12, swpfTime: 18.562, speedup: 1.084, baseDram: 146.68, swpfDram: 167.21, dramRatio: 1.14, baseRead: 12.667, swpfRead: 11.203, dramQuality: "good" },
  { workload: "sssp-urand", kernel: "sssp", baseTime: 119.425, swpfTime: 121.337, speedup: 0.9842, baseDram: 546.89, swpfDram: 509.62, dramRatio: 0.9319, baseRead: 269.745, swpfRead: 14.064, dramQuality: "unusable" },
  { workload: "sssp-web", kernel: "sssp", baseTime: 19.07, swpfTime: 18.731, speedup: 1.0181, baseDram: 196.39, swpfDram: 158.83, dramRatio: 0.8087, baseRead: 236.654, swpfRead: 14.401, dramQuality: "unusable" },
  { workload: "tc-urand", kernel: "tc", baseTime: 570.342, swpfTime: 582.669, speedup: 0.9788, baseDram: 918.16, swpfDram: 1781.66, dramRatio: 1.9405, baseRead: 8.667, swpfRead: 7.458, dramQuality: "good" },
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
    "swpfScatterHover",
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
  // tc-urand sits at ~1.94x DRAM — keep it on-canvas without crushing the rest.
  const xMin = Math.min(0.7, ...xs) - 0.02;
  const xMax = Math.max(2.05, ...xs) + 0.02;
  const yMin = Math.min(0.85, ...ys) - 0.03;
  const yMax = Math.max(1.4, ...ys) + 0.03;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
  const yTicks = [0.9, 1.0, 1.1, 1.2, 1.3];

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

export default function SwpfVsBaseline() {
  const unusable = ROWS.filter((r) => r.dramQuality === "unusable");
  const usable = ROWS.filter((r) => r.dramQuality !== "unusable");

  const geoSpeedup = geomean(usable.map((r) => r.speedup));
  const geoDram = geomean(usable.map((r) => r.dramRatio));
  const wins = usable.filter((r) => r.speedup > 1).length;
  const losses = usable.length - wins;

  const scatterPoints: ScatterPoint[] = usable.map((r) => ({
    workload: r.workload,
    kernel: r.kernel,
    x: r.dramRatio,
    y: r.speedup,
    quality: r.dramQuality,
  }));

  const speedSorted = [...usable].sort((a, b) => b.speedup - a.speedup);
  const best = speedSorted[0];
  const worst = speedSorted[speedSorted.length - 1];

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={6}>
        <H1>Software prefetch (swpf) vs baseline — GAP suite</H1>
        <Text tone="secondary">
          swpf from `gap/output/figure6_4`, baseline from `gap/output/figure6`.
          Plots and stats use {usable.length} of {ROWS.length} kernel/graph
          pairs after dropping DRAM-unusable runs. Speedup is baseline kernel
          time / swpf kernel time (GAP `Average Time`). DRAM traffic is summed
          `uncore_imc_*` CAS read+write over the whole process.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat
          value={`${fmt(geoSpeedup)}x`}
          label="Geomean speedup vs figure6 baseline"
          tone={geoSpeedup > 1 ? "success" : "danger"}
        />
        <Stat value={`${wins} / ${losses}`} label="Workloads faster / slower" />
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

      <Callout tone="info" title="Same cross-campaign caveat as htpf">
        Baseline and swpf come from different collection directories, so absolute
        magnitudes mix environment drift with the prefetch effect. The scatter
        is still useful for shape: where swpf sits relative to DRAM and speedup
        parity, and how that differs from htpf.
      </Callout>

      <Stack gap={8}>
        <H2>DRAM traffic ratio vs speedup</H2>
        <Text size="small" tone="tertiary">
          Each point is one kernel/graph pair. X = swpf DRAM / baseline DRAM; Y =
          baseline time / swpf time. Colored by kernel. Best: `
          {best.workload}` at {fmt(best.speedup)}x. Worst: `{worst.workload}` at{" "}
          {fmt(worst.speedup)}x.
        </Text>
        <DramSpeedupScatter
          points={scatterPoints}
          xLabel="DRAM traffic ratio (swpf / baseline)"
          yLabel="Speedup (baseline / swpf)"
        />
        <Text size="small" tone="tertiary">
          Unlike htpf, swpf stays near the 1.0x speedup line for most workloads
          (geomean {fmt(geoSpeedup)}x). Gains concentrate in `bfs` and a few
          `cc`/`pr-web` points, all near DRAM parity. `bc-*` and `tc-urand` sit
          below parity on speedup while moving more DRAM — `tc-urand` is the
          far-right outlier at 1.94x DRAM with a 0.98x slowdown.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Full measurements</H2>
        <Text size="small" tone="tertiary">
          Times are GAP `Average Time` in seconds (kernel only). DRAM is total
          CAS read+write in GiB (whole run). Unusable-DRAM workloads are omitted
          (listed above).
        </Text>
        <Table
          headers={[
            "Workload",
            "Base time (s)",
            "swpf time (s)",
            "Speedup",
            "Base DRAM (GiB)",
            "swpf DRAM (GiB)",
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
            "left",
          ]}
          rowTone={speedSorted.map((r) =>
            r.speedup > 1 ? "success" : "danger",
          )}
          rows={speedSorted.map((r) => [
            r.workload,
            fmt(r.baseTime),
            fmt(r.swpfTime),
            `${fmt(r.speedup)}x`,
            fmt(r.baseDram, 1),
            fmt(r.swpfDram, 1),
            `${fmt(r.dramRatio)}x`,
            r.dramQuality,
          ])}
          striped
          stickyHeader
        />
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Omitted workloads (unusable DRAM)</H2>
        <Text tone="secondary">
          Whole-process DRAM counters contaminated by unequal graph read-in
          (baseline rebuilt weighted graphs; swpf reused cache):
        </Text>
        <Table
          headers={[
            "Workload",
            "Baseline read (s)",
            "swpf read (s)",
            "Kernel time (s)",
            "Reported DRAM ratio",
          ]}
          columnAlign={["left", "right", "right", "right", "right"]}
          rows={unusable.map((r) => [
            r.workload,
            fmt(r.baseRead, 1),
            fmt(r.swpfRead, 1),
            fmt(r.swpfTime, 1),
            `${fmt(r.dramRatio)}x`,
          ])}
        />
      </Stack>
    </Stack>
  );
}
