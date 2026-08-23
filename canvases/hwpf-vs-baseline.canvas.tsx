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
  /**
   * Kernel-only Average Time from figure6_4 *-baseline.txt files, which
   * this campaign treats as hardware-prefetch (hwpf) runs.
   */
  hwpfTime: number;
  speedup: number;
  /** Whole-run DRAM traffic (CAS read+write), GiB. */
  baseDram: number;
  hwpfDram: number;
  dramRatio: number;
  baseRead: number;
  hwpfRead: number;
  dramQuality: DramQuality;
};

/**
 * hwpf = gap/output/figure6_4/*-baseline.txt
 * baseline = gap/output/figure6/*-baseline.txt
 */
const ROWS: Measurement[] = [
  { workload: "bc-kron", kernel: "bc", baseTime: 86.857, hwpfTime: 84.005, speedup: 1.034, baseDram: 333.51, hwpfDram: 381.73, dramRatio: 1.1446, baseRead: 8.591, hwpfRead: 7.253, dramQuality: "good" },
  { workload: "bc-twitter", kernel: "bc", baseTime: 31.113, hwpfTime: 30.57, speedup: 1.0178, baseDram: 180.2, hwpfDram: 205.32, dramRatio: 1.1394, baseRead: 6.727, hwpfRead: 5.887, dramQuality: "good" },
  { workload: "bc-urand", kernel: "bc", baseTime: 158.087, hwpfTime: 156.995, speedup: 1.007, baseDram: 567.16, hwpfDram: 642.85, dramRatio: 1.1334, baseRead: 8.711, hwpfRead: 7.354, dramQuality: "good" },
  { workload: "bc-road", kernel: "bc", baseTime: 2.06, hwpfTime: 2.009, speedup: 1.0252, baseDram: 9.2, hwpfDram: 8.82, dramRatio: 0.958, baseRead: 0.55, hwpfRead: 0.459, dramQuality: "good" },
  { workload: "bc-web", kernel: "bc", baseTime: 10.569, hwpfTime: 9.173, speedup: 1.1522, baseDram: 82.94, hwpfDram: 88.03, dramRatio: 1.0613, baseRead: 8.41, hwpfRead: 7.428, dramQuality: "good" },
  { workload: "bfs-kron", kernel: "bfs", baseTime: 4.158, hwpfTime: 3.85, speedup: 1.0798, baseDram: 74.43, hwpfDram: 75.16, dramRatio: 1.0099, baseRead: 8.577, hwpfRead: 7.263, dramQuality: "fair" },
  { workload: "bfs-twitter", kernel: "bfs", baseTime: 2.736, hwpfTime: 2.417, speedup: 1.1318, baseDram: 50.82, hwpfDram: 52.04, dramRatio: 1.0239, baseRead: 6.721, hwpfRead: 5.891, dramQuality: "fair" },
  { workload: "bfs-urand", kernel: "bfs", baseTime: 11.134, hwpfTime: 9.64, speedup: 1.155, baseDram: 83.7, hwpfDram: 84.19, dramRatio: 1.0058, baseRead: 8.713, hwpfRead: 7.373, dramQuality: "fair" },
  { workload: "bfs-road", kernel: "bfs", baseTime: 0.999, hwpfTime: 0.917, speedup: 1.0894, baseDram: 5.57, hwpfDram: 5.65, dramRatio: 1.0141, baseRead: 0.549, hwpfRead: 0.463, dramQuality: "good" },
  { workload: "bfs-web", kernel: "bfs", baseTime: 6.671, hwpfTime: 4.523, speedup: 1.475, baseDram: 71.26, hwpfDram: 72.57, dramRatio: 1.0183, baseRead: 8.412, hwpfRead: 7.431, dramQuality: "fair" },
  { workload: "cc-kron", kernel: "cc", baseTime: 8.006, hwpfTime: 7.646, speedup: 1.0471, baseDram: 77.08, hwpfDram: 109.85, dramRatio: 1.4252, baseRead: 8.587, hwpfRead: 136.425, dramQuality: "unusable" },
  { workload: "cc-twitter", kernel: "cc", baseTime: 2.79, hwpfTime: 2.511, speedup: 1.1107, baseDram: 51.11, hwpfDram: 52.66, dramRatio: 1.0303, baseRead: 6.723, hwpfRead: 5.895, dramQuality: "fair" },
  { workload: "cc-urand", kernel: "cc", baseTime: 24.682, hwpfTime: 23.592, speedup: 1.0462, baseDram: 99.5, hwpfDram: 129.13, dramRatio: 1.2977, baseRead: 8.71, hwpfRead: 138.61, dramQuality: "unusable" },
  { workload: "cc-road", kernel: "cc", baseTime: 0.698, hwpfTime: 0.616, speedup: 1.1322, baseDram: 5.55, hwpfDram: 7.19, dramRatio: 1.2969, baseRead: 0.544, hwpfRead: 5.521, dramQuality: "unusable" },
  { workload: "cc-web", kernel: "cc", baseTime: 2.371, hwpfTime: 1.981, speedup: 1.1966, baseDram: 64.41, hwpfDram: 91.29, dramRatio: 1.4174, baseRead: 8.416, hwpfRead: 123.097, dramQuality: "unusable" },
  { workload: "pr-kron", kernel: "pr", baseTime: 151.809, hwpfTime: 150.017, speedup: 1.0119, baseDram: 624.42, hwpfDram: 619.87, dramRatio: 0.9927, baseRead: 8.56, hwpfRead: 7.353, dramQuality: "good" },
  { workload: "pr-twitter", kernel: "pr", baseTime: 129.695, hwpfTime: 126.997, speedup: 1.0212, baseDram: 430.3, hwpfDram: 428.1, dramRatio: 0.9949, baseRead: 6.74, hwpfRead: 5.923, dramQuality: "good" },
  { workload: "pr-urand", kernel: "pr", baseTime: 191.037, hwpfTime: 190.546, speedup: 1.0026, baseDram: 981.62, hwpfDram: 982.14, dramRatio: 1.0005, baseRead: 8.684, hwpfRead: 7.452, dramQuality: "good" },
  { workload: "pr-road", kernel: "pr", baseTime: 3.445, hwpfTime: 3.137, speedup: 1.0985, baseDram: 22.71, hwpfDram: 22.69, dramRatio: 0.999, baseRead: 0.554, hwpfRead: 0.471, dramQuality: "good" },
  { workload: "pr-web", kernel: "pr", baseTime: 44.77, hwpfTime: 31.551, speedup: 1.419, baseDram: 218.89, hwpfDram: 218.57, dramRatio: 0.9985, baseRead: 8.356, hwpfRead: 7.484, dramQuality: "good" },
  { workload: "sssp-kron", kernel: "sssp", baseTime: 56.911, hwpfTime: 55.847, speedup: 1.0191, baseDram: 342.18, hwpfDram: 368.03, dramRatio: 1.0755, baseRead: 265.351, hwpfRead: 265.243, dramQuality: "good" },
  { workload: "sssp-twitter", kernel: "sssp", baseTime: 20.12, hwpfTime: 20.056, speedup: 1.0032, baseDram: 146.68, hwpfDram: 165.4, dramRatio: 1.1277, baseRead: 12.667, hwpfRead: 11.207, dramQuality: "good" },
  { workload: "sssp-urand", kernel: "sssp", baseTime: 119.425, hwpfTime: 119.117, speedup: 1.0026, baseDram: 546.89, hwpfDram: 566.76, dramRatio: 1.0363, baseRead: 269.745, hwpfRead: 269.613, dramQuality: "good" },
  { workload: "sssp-web", kernel: "sssp", baseTime: 19.07, hwpfTime: 18.75, speedup: 1.0171, baseDram: 196.39, hwpfDram: 210.19, dramRatio: 1.0703, baseRead: 236.654, hwpfRead: 240.848, dramQuality: "fair" },
  { workload: "tc-kron", kernel: "tc", baseTime: 7022.853, hwpfTime: 6382.928, speedup: 1.1003, baseDram: 10990.34, hwpfDram: 12594.94, dramRatio: 1.146, baseRead: 8.562, hwpfRead: 7.349, dramQuality: "good" },
  { workload: "tc-urand", kernel: "tc", baseTime: 570.342, hwpfTime: 575.686, speedup: 0.9907, baseDram: 918.16, hwpfDram: 1816.36, dramRatio: 1.9783, baseRead: 8.667, hwpfRead: 7.454, dramQuality: "good" },
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
    "hwpfScatterHover",
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
  // tc-urand sits near 2.0x DRAM.
  const xMin = Math.min(0.7, ...xs) - 0.02;
  const xMax = Math.max(2.1, ...xs) + 0.02;
  const yMin = Math.min(0.9, ...ys) - 0.03;
  const yMax = Math.max(1.55, ...ys) + 0.03;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
  const yTicks = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

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

export default function HwpfVsBaseline() {
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
        <H1>Hardware prefetch (hwpf) vs baseline — GAP suite</H1>
        <Text tone="secondary">
          hwpf from `gap/output/figure6_4/*-baseline.txt` (this campaign stores
          hwpf under the `-baseline` filename), reference baseline from
          `gap/output/figure6/*-baseline.txt`. Plots and stats use{" "}
          {usable.length} of {ROWS.length} kernel/graph pairs after dropping
          DRAM-unusable runs (includes `tc-kron`, which had no htpf/swpf run in
          figure6_4). Speedup is baseline kernel time / hwpf kernel time. DRAM
          is summed `uncore_imc_*` CAS read+write over the whole process.
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

      <Stack gap={8}>
        <H2>DRAM traffic ratio vs speedup</H2>
        <Text size="small" tone="tertiary">
          Each point is one kernel/graph pair. X = hwpf DRAM / baseline DRAM; Y =
          baseline time / hwpf time. Colored by kernel. Best: `
          {best.workload}` at {fmt(best.speedup)}x. Worst: `{worst.workload}` at{" "}
          {fmt(worst.speedup)}x.
        </Text>
        <DramSpeedupScatter
          points={scatterPoints}
          xLabel="DRAM traffic ratio (hwpf / baseline)"
          yLabel="Speedup (baseline / hwpf)"
        />
        <Text size="small" tone="tertiary">
          Among usable workloads, nearly all are at or above 1.0x speedup. The
          large gains are `bfs-web` (1.48x) and `pr-web` (1.42x), both near DRAM
          parity. Several `bc`/`sssp`/`tc` points sit to the right of DRAM
          parity with only small speedups. Sole slowdown among usable runs:
          `tc-urand` at 0.99x with 1.98x DRAM.
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
            "hwpf time (s)",
            "Speedup",
            "Base DRAM (GiB)",
            "hwpf DRAM (GiB)",
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
            fmt(r.hwpfTime),
            `${fmt(r.speedup)}x`,
            fmt(r.baseDram, 1),
            fmt(r.hwpfDram, 1),
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
          These `cc` pairs report much longer graph read-in in the figure6_4
          (hwpf) run than in figure6, so whole-process DRAM ratios are not
          kernel-comparable:
        </Text>
        <Table
          headers={[
            "Workload",
            "Baseline read (s)",
            "hwpf read (s)",
            "Kernel time (s)",
            "Reported DRAM ratio",
          ]}
          columnAlign={["left", "right", "right", "right", "right"]}
          rows={unusable.map((r) => [
            r.workload,
            fmt(r.baseRead, 1),
            fmt(r.hwpfRead, 1),
            fmt(r.hwpfTime, 1),
            `${fmt(r.dramRatio)}x`,
          ])}
        />
      </Stack>
    </Stack>
  );
}
