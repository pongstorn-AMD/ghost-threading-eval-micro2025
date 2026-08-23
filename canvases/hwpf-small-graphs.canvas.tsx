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

type Measurement = {
  workload: string;
  kernel: string;
  /** Valid attempts used in the average (of 5), after dropping non-positive kernel DRAM. */
  nOk: number;
  /** Mean wo_hwpf Average Time across valid attempts, seconds. */
  baseTime: number;
  /** Mean w_hwpf Average Time across valid attempts, seconds. */
  hwpfTime: number;
  speedup: number;
  /** Mean kernel-only DRAM = full − _2rd, GiB. */
  baseDram: number;
  hwpfDram: number;
  baseDramRead: number;
  hwpfDramRead: number;
  dramRatio: number;
  speedupMin: number;
  speedupMax: number;
  dramMin: number;
  dramMax: number;
};

/**
 * Source: gap/output_small_graphs.tgz (5 attempts per workload).
 * Per attempt: kernel DRAM = full − *_2rd; speedup = wo / w time.
 * Attempts with non-positive kernel DRAM are dropped; remaining attempts
 * are averaged (mean times / mean kernel DRAMs), then ratio recomputed.
 * tc-* excluded (directed graphs).
 */
const ROWS: Measurement[] = [
  { workload: "bc-as_skitter", kernel: "bc", nOk: 5, baseTime: 0.013584, hwpfTime: 0.01166, speedup: 1.165, baseDram: 0.0307, hwpfDram: 0.0316, baseDramRead: 0.2948, hwpfDramRead: 0.2975, dramRatio: 1.03, speedupMin: 1.1324, speedupMax: 1.2077, dramMin: 0.6252, dramMax: 2.1993 },
  { workload: "bc-livejournal", kernel: "bc", nOk: 5, baseTime: 1.249062, hwpfTime: 1.209948, speedup: 1.0323, baseDram: 1.9482, hwpfDram: 2.0277, baseDramRead: 1.934, hwpfDramRead: 1.9135, dramRatio: 1.0408, speedupMin: 1.0296, speedupMax: 1.0339, dramMin: 1.0323, dramMax: 1.057 },
  { workload: "bc-orkut", kernel: "bc", nOk: 5, baseTime: 0.052994, hwpfTime: 0.045566, speedup: 1.163, baseDram: 0.1441, hwpfDram: 0.1475, baseDramRead: 2.885, hwpfDramRead: 2.8785, dramRatio: 1.0236, speedupMin: 1.101, speedupMax: 1.1922, dramMin: 0.7274, dramMax: 1.3014 },
  { workload: "bc-pokec", kernel: "bc", nOk: 5, baseTime: 0.475722, hwpfTime: 0.46812, speedup: 1.0162, baseDram: 0.4756, hwpfDram: 0.4743, baseDramRead: 0.7407, hwpfDramRead: 0.7525, dramRatio: 0.9974, speedupMin: 1.0135, speedupMax: 1.0178, dramMin: 0.9573, dramMax: 1.0226 },
  { workload: "bc-roadnetca", kernel: "bc", nOk: 5, baseTime: 0.122324, hwpfTime: 0.117196, speedup: 1.0438, baseDram: 0.0928, hwpfDram: 0.1013, baseDramRead: 0.1864, hwpfDramRead: 0.1926, dramRatio: 1.0912, speedupMin: 1.0386, speedupMax: 1.053, dramMin: 1.0302, dramMax: 1.2727 },
  { workload: "bc-web_berkstan", kernel: "bc", nOk: 5, baseTime: 0.037522, hwpfTime: 0.031716, speedup: 1.1831, baseDram: 0.0335, hwpfDram: 0.0334, baseDramRead: 0.1489, hwpfDramRead: 0.1504, dramRatio: 0.9984, speedupMin: 1.173, speedupMax: 1.1958, dramMin: 0.871, dramMax: 1.0779 },
  { workload: "bc-web_google", kernel: "bc", nOk: 5, baseTime: 0.00685, hwpfTime: 0.006056, speedup: 1.1311, baseDram: 0.0096, hwpfDram: 0.0105, baseDramRead: 0.117, hwpfDramRead: 0.1195, dramRatio: 1.0951, speedupMin: 1.0476, speedupMax: 1.2273, dramMin: 0.6695, dramMax: 3.6244 },
  { workload: "bc-wiki_talk", kernel: "bc", nOk: 5, baseTime: 0.136726, hwpfTime: 0.127478, speedup: 1.0725, baseDram: 0.1388, hwpfDram: 0.1447, baseDramRead: 0.2112, hwpfDramRead: 0.2317, dramRatio: 1.0426, speedupMin: 1.061, speedupMax: 1.0798, dramMin: 0.828, dramMax: 1.7024 },
  { workload: "bc-youtube", kernel: "bc", nOk: 4, baseTime: 0.008805, hwpfTime: 0.007582, speedup: 1.1612, baseDram: 0.0159, hwpfDram: 0.01, baseDramRead: 0.0907, hwpfDramRead: 0.0945, dramRatio: 0.6258, speedupMin: 1.1266, speedupMax: 1.2116, dramMin: 0.3716, dramMax: 1.5302 },
  { workload: "bfs-as_skitter", kernel: "bfs", nOk: 3, baseTime: 0.011097, hwpfTime: 0.008497, speedup: 1.306, baseDram: 0.0171, hwpfDram: 0.0107, baseDramRead: 0.2841, hwpfDramRead: 0.2908, dramRatio: 0.6279, speedupMin: 1.278, speedupMax: 1.3388, dramMin: 0.1927, dramMax: 1.7109 },
  { workload: "bfs-livejournal", kernel: "bfs", nOk: 5, baseTime: 0.250872, hwpfTime: 0.163748, speedup: 1.5321, baseDram: 0.5024, hwpfDram: 0.6218, baseDramRead: 1.9333, hwpfDramRead: 1.9362, dramRatio: 1.2375, speedupMin: 1.5164, speedupMax: 1.5448, dramMin: 1.1695, dramMax: 1.3454 },
  { workload: "bfs-orkut", kernel: "bfs", nOk: 5, baseTime: 0.027476, hwpfTime: 0.02026, speedup: 1.3562, baseDram: 0.0536, hwpfDram: 0.0462, baseDramRead: 2.8711, hwpfDramRead: 2.8658, dramRatio: 0.8623, speedupMin: 1.3182, speedupMax: 1.4196, dramMin: 0.6901, dramMax: 1.1235 },
  { workload: "bfs-pokec", kernel: "bfs", nOk: 5, baseTime: 0.063094, hwpfTime: 0.04869, speedup: 1.2958, baseDram: 0.1248, hwpfDram: 0.1737, baseDramRead: 0.7364, hwpfDramRead: 0.7336, dramRatio: 1.3911, speedupMin: 1.2835, speedupMax: 1.3134, dramMin: 1.2834, dramMax: 1.5024 },
  { workload: "bfs-roadnetca", kernel: "bfs", nOk: 5, baseTime: 0.05458, hwpfTime: 0.050622, speedup: 1.0782, baseDram: 0.0281, hwpfDram: 0.0295, baseDramRead: 0.1836, hwpfDramRead: 0.1916, dramRatio: 1.0473, speedupMin: 1.0737, speedupMax: 1.0815, dramMin: 0.9307, dramMax: 1.2892 },
  { workload: "bfs-web_berkstan", kernel: "bfs", nOk: 5, baseTime: 0.040622, hwpfTime: 0.028624, speedup: 1.4192, baseDram: 0.0335, hwpfDram: 0.0372, baseDramRead: 0.139, hwpfDramRead: 0.1409, dramRatio: 1.1104, speedupMin: 1.4042, speedupMax: 1.427, dramMin: 0.9828, dramMax: 1.5355 },
  { workload: "bfs-web_google", kernel: "bfs", nOk: 2, baseTime: 0.006125, hwpfTime: 0.005325, speedup: 1.1502, baseDram: 0.0084, hwpfDram: 0.0024, baseDramRead: 0.1121, hwpfDramRead: 0.117, dramRatio: 0.2881, speedupMin: 1.1131, speedupMax: 1.1896, dramMin: 0.2133, dramMax: 0.4317 },
  { workload: "bfs-wiki_talk", kernel: "bfs", nOk: 5, baseTime: 0.048968, hwpfTime: 0.036562, speedup: 1.3393, baseDram: 0.0358, hwpfDram: 0.0435, baseDramRead: 0.2062, hwpfDramRead: 0.2035, dramRatio: 1.2166, speedupMin: 1.3115, speedupMax: 1.3725, dramMin: 1.037, dramMax: 1.3185 },
  { workload: "bfs-youtube", kernel: "bfs", nOk: 2, baseTime: 0.00695, hwpfTime: 0.00622, speedup: 1.1174, baseDram: 0.0007, hwpfDram: 0.0025, baseDramRead: 0.0882, hwpfDramRead: 0.0892, dramRatio: 3.4324, speedupMin: 1.1056, speedupMax: 1.1292, dramMin: 3.1667, dramMax: 3.5179 },
  { workload: "cc-as_skitter", kernel: "cc", nOk: 5, baseTime: 0.07192, hwpfTime: 0.060304, speedup: 1.1926, baseDram: 0.0749, hwpfDram: 0.0906, baseDramRead: 0.2839, hwpfDramRead: 0.2821, dramRatio: 1.2098, speedupMin: 1.1817, speedupMax: 1.2046, dramMin: 0.7546, dramMax: 1.6344 },
  { workload: "cc-livejournal", kernel: "cc", nOk: 5, baseTime: 0.232958, hwpfTime: 0.187294, speedup: 1.2438, baseDram: 0.482, hwpfDram: 0.6049, baseDramRead: 1.9257, hwpfDramRead: 1.9212, dramRatio: 1.2551, speedupMin: 1.1828, speedupMax: 1.294, dramMin: 1.0307, dramMax: 1.4167 },
  { workload: "cc-orkut", kernel: "cc", nOk: 5, baseTime: 0.246564, hwpfTime: 0.20605, speedup: 1.1966, baseDram: 0.4228, hwpfDram: 0.5796, baseDramRead: 2.8828, hwpfDramRead: 2.8769, dramRatio: 1.3708, speedupMin: 1.1692, speedupMax: 1.2186, dramMin: 1.3286, dramMax: 1.4695 },
  { workload: "cc-pokec", kernel: "cc", nOk: 5, baseTime: 0.06796, hwpfTime: 0.054968, speedup: 1.2364, baseDram: 0.179, hwpfDram: 0.2321, baseDramRead: 0.7328, hwpfDramRead: 0.7346, dramRatio: 1.2962, speedupMin: 1.2137, speedupMax: 1.2627, dramMin: 1.2393, dramMax: 1.3937 },
  { workload: "cc-roadnetca", kernel: "cc", nOk: 5, baseTime: 0.045208, hwpfTime: 0.035286, speedup: 1.2812, baseDram: 0.0358, hwpfDram: 0.037, baseDramRead: 0.183, hwpfDramRead: 0.1787, dramRatio: 1.0342, speedupMin: 1.2738, speedupMax: 1.2876, dramMin: 0.7088, dramMax: 1.1719 },
  { workload: "cc-web_berkstan", kernel: "cc", nOk: 5, baseTime: 0.019218, hwpfTime: 0.012692, speedup: 1.5142, baseDram: 0.0281, hwpfDram: 0.0271, baseDramRead: 0.1367, hwpfDramRead: 0.1299, dramRatio: 0.9646, speedupMin: 1.4844, speedupMax: 1.5351, dramMin: 0.7461, dramMax: 1.1818 },
  { workload: "cc-web_google", kernel: "cc", nOk: 4, baseTime: 0.040497, hwpfTime: 0.036095, speedup: 1.122, baseDram: 0.0326, hwpfDram: 0.0249, baseDramRead: 0.105, hwpfDramRead: 0.0981, dramRatio: 0.7645, speedupMin: 1.1161, speedupMax: 1.1249, dramMin: 0.5652, dramMax: 1.1948 },
  { workload: "cc-wiki_talk", kernel: "cc", nOk: 5, baseTime: 0.041114, hwpfTime: 0.026964, speedup: 1.5248, baseDram: 0.0203, hwpfDram: 0.0237, baseDramRead: 0.2105, hwpfDramRead: 0.2089, dramRatio: 1.1683, speedupMin: 1.4943, speedupMax: 1.5459, dramMin: 0.8843, dramMax: 1.5856 },
  { workload: "cc-youtube", kernel: "cc", nOk: 4, baseTime: 0.034202, hwpfTime: 0.03124, speedup: 1.0948, baseDram: 0.0167, hwpfDram: 0.0291, baseDramRead: 0.0837, hwpfDramRead: 0.0619, dramRatio: 1.7435, speedupMin: 1.0698, speedupMax: 1.1194, dramMin: 0.4311, dramMax: 8.6153 },
  { workload: "pr-as_skitter", kernel: "pr", nOk: 5, baseTime: 0.06365, hwpfTime: 0.040442, speedup: 1.5739, baseDram: 0.1159, hwpfDram: 0.1026, baseDramRead: 0.2747, hwpfDramRead: 0.2914, dramRatio: 0.885, speedupMin: 1.5534, speedupMax: 1.5848, dramMin: 0.7342, dramMax: 1.011 },
  { workload: "pr-livejournal", kernel: "pr", nOk: 5, baseTime: 4.566672, hwpfTime: 3.208538, speedup: 1.4233, baseDram: 6.8243, hwpfDram: 6.6976, baseDramRead: 1.9364, hwpfDramRead: 1.9488, dramRatio: 0.9814, speedupMin: 1.4212, speedupMax: 1.4249, dramMin: 0.9686, dramMax: 0.9874 },
  { workload: "pr-orkut", kernel: "pr", nOk: 5, baseTime: 0.787404, hwpfTime: 0.462002, speedup: 1.7043, baseDram: 1.0875, hwpfDram: 1.0938, baseDramRead: 2.9026, hwpfDramRead: 2.9073, dramRatio: 1.0058, speedupMin: 1.6809, speedupMax: 1.7149, dramMin: 0.9344, dramMax: 1.0792 },
  { workload: "pr-pokec", kernel: "pr", nOk: 5, baseTime: 1.661458, hwpfTime: 1.391462, speedup: 1.194, baseDram: 1.7048, hwpfDram: 1.6383, baseDramRead: 0.7343, hwpfDramRead: 0.7422, dramRatio: 0.961, speedupMin: 1.1881, speedupMax: 1.1981, dramMin: 0.9347, dramMax: 0.9787 },
  { workload: "pr-roadnetca", kernel: "pr", nOk: 5, baseTime: 0.250142, hwpfTime: 0.22183, speedup: 1.1276, baseDram: 0.0829, hwpfDram: 0.0863, baseDramRead: 0.1747, hwpfDramRead: 0.1819, dramRatio: 1.0406, speedupMin: 1.1233, speedupMax: 1.1316, dramMin: 0.9429, dramMax: 1.2678 },
  { workload: "pr-web_berkstan", kernel: "pr", nOk: 5, baseTime: 0.175532, hwpfTime: 0.132832, speedup: 1.3215, baseDram: 0.0574, hwpfDram: 0.0502, baseDramRead: 0.1319, hwpfDramRead: 0.1357, dramRatio: 0.8741, speedupMin: 1.317, speedupMax: 1.3254, dramMin: 0.8249, dramMax: 0.9912 },
  { workload: "pr-web_google", kernel: "pr", nOk: 5, baseTime: 0.220422, hwpfTime: 0.215222, speedup: 1.0242, baseDram: 0.0457, hwpfDram: 0.0433, baseDramRead: 0.1045, hwpfDramRead: 0.1045, dramRatio: 0.9478, speedupMin: 1.0216, speedupMax: 1.0277, dramMin: 0.77, dramMax: 1.133 },
  { workload: "pr-wiki_talk", kernel: "pr", nOk: 5, baseTime: 0.126084, hwpfTime: 0.099094, speedup: 1.2724, baseDram: 0.0814, hwpfDram: 0.0796, baseDramRead: 0.191, hwpfDramRead: 0.1863, dramRatio: 0.9778, speedupMin: 1.2658, speedupMax: 1.2777, dramMin: 0.7809, dramMax: 1.5785 },
  { workload: "pr-youtube", kernel: "pr", nOk: 4, baseTime: 0.021615, hwpfTime: 0.018, speedup: 1.2008, baseDram: 0.0188, hwpfDram: 0.0184, baseDramRead: 0.0784, hwpfDramRead: 0.0814, dramRatio: 0.9761, speedupMin: 1.1904, speedupMax: 1.2207, dramMin: 0.7594, dramMax: 1.2981 },
  { workload: "sssp-as_skitter", kernel: "sssp", nOk: 3, baseTime: 0.00178, hwpfTime: 0.001607, speedup: 1.1079, baseDram: 0.0079, hwpfDram: 0.0073, baseDramRead: 0.5427, hwpfDramRead: 0.543, dramRatio: 0.9298, speedupMin: 1.092, speedupMax: 1.1258, dramMin: 0.2482, dramMax: 2.4895 },
  { workload: "sssp-livejournal", kernel: "sssp", nOk: 5, baseTime: 0.989736, hwpfTime: 0.951364, speedup: 1.0403, baseDram: 1.5303, hwpfDram: 1.5946, baseDramRead: 3.5207, hwpfDramRead: 3.5238, dramRatio: 1.042, speedupMin: 1.0378, speedupMax: 1.0447, dramMin: 1.022, dramMax: 1.0792 },
  { workload: "sssp-orkut", kernel: "sssp", nOk: 4, baseTime: 0.02118, hwpfTime: 0.019772, speedup: 1.0712, baseDram: 0.0526, hwpfDram: 0.048, baseDramRead: 5.6106, hwpfDramRead: 5.5956, dramRatio: 0.9134, speedupMin: 1.0255, speedupMax: 1.0924, dramMin: 0.0423, dramMax: 61.7934 },
  { workload: "sssp-pokec", kernel: "sssp", nOk: 5, baseTime: 0.348696, hwpfTime: 0.340932, speedup: 1.0228, baseDram: 0.5128, hwpfDram: 0.5523, baseDramRead: 1.4459, hwpfDramRead: 1.4454, dramRatio: 1.0769, speedupMin: 1.0134, speedupMax: 1.0294, dramMin: 1.027, dramMax: 1.1398 },
  { workload: "sssp-roadnetca", kernel: "sssp", nOk: 5, baseTime: 0.12257, hwpfTime: 0.116224, speedup: 1.0546, baseDram: 0.09, hwpfDram: 0.0932, baseDramRead: 0.3073, hwpfDramRead: 0.317, dramRatio: 1.036, speedupMin: 1.0303, speedupMax: 1.0704, dramMin: 0.8412, dramMax: 1.2048 },
  { workload: "sssp-web_berkstan", kernel: "sssp", nOk: 5, baseTime: 0.05173, hwpfTime: 0.049984, speedup: 1.0349, baseDram: 0.0602, hwpfDram: 0.0563, baseDramRead: 0.3104, hwpfDramRead: 0.3126, dramRatio: 0.9353, speedupMin: 1.0313, speedupMax: 1.0393, dramMin: 0.684, dramMax: 1.1907 },
  { workload: "sssp-web_google", kernel: "sssp", nOk: 3, baseTime: 0.000883, hwpfTime: 0.00084, speedup: 1.0516, baseDram: 0.0017, hwpfDram: 0.0029, baseDramRead: 0.2241, hwpfDramRead: 0.2269, dramRatio: 1.7642, speedupMin: 0.9239, speedupMax: 1.2, dramMin: 0.3144, dramMax: 3.541 },
  { workload: "sssp-wiki_talk", kernel: "sssp", nOk: 5, baseTime: 0.076792, hwpfTime: 0.071014, speedup: 1.0814, baseDram: 0.0937, hwpfDram: 0.0837, baseDramRead: 0.3089, hwpfDramRead: 0.3213, dramRatio: 0.8933, speedupMin: 1.0718, speedupMax: 1.0888, dramMin: 0.676, dramMax: 1.4178 },
  { workload: "sssp-youtube", kernel: "sssp", nOk: 2, baseTime: 0.001455, hwpfTime: 0.001355, speedup: 1.0738, baseDram: 0.003, hwpfDram: 0.0019, baseDramRead: 0.1487, hwpfDramRead: 0.1526, dramRatio: 0.6425, speedupMin: 1.0144, speedupMax: 1.1364, dramMin: 0.2204, dramMax: 4.6379 },
];

const KERNELS = ["bc", "bfs", "cc", "pr", "sssp"] as const;

const KERNEL_COLOR: Record<(typeof KERNELS)[number], Color> = {
  bc: "blue",
  bfs: "green",
  cc: "cyan",
  pr: "red",
  sssp: "purple",
};

function geomean(values: number[]): number {
  const usable = values.filter((v) => Number.isFinite(v) && v > 0);
  if (usable.length === 0) return Number.NaN;
  return Math.exp(
    usable.reduce((acc, v) => acc + Math.log(v), 0) / usable.length,
  );
}

function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

type ScatterPoint = {
  workload: string;
  kernel: string;
  x: number;
  y: number;
  nOk: number;
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
    "smallHwpf5runScatterHover",
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
  const xMin = 0.2;
  const xMax = Math.max(3.6, ...xs) + 0.1;
  const yMin = 0.95;
  const yMax = Math.max(1.8, ...ys) + 0.03;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = [0.5, 1, 1.5, 2, 2.5, 3, 3.5];
  const yTicks = [1.0, 1.2, 1.4, 1.6, 1.8];

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
                fill={color}
                stroke={color}
                strokeWidth={isHover ? 2 : 1}
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
                  {p.workload} · {fmt(p.y)}x / {fmt(p.x)}x · n={p.nOk}/5
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
          {fmt(active.x)}x (averaged over {active.nOk}/5 valid attempts)
        </Text>
      ) : (
        <Text size="small" tone="tertiary">
          Geomean (n={points.length}): speedup {fmt(geoY)}x, DRAM ratio{" "}
          {fmt(geoX)}x. Hover a point to inspect.
        </Text>
      )}
    </Stack>
  );
}

export default function HwpfSmallGraphs5Run() {
  const geoSpeedup = geomean(ROWS.map((r) => r.speedup));
  const geoDram = geomean(ROWS.map((r) => r.dramRatio));
  const wins = ROWS.filter((r) => r.speedup > 1).length;
  const losses = ROWS.length - wins;
  const partial = ROWS.filter((r) => r.nOk < 5);

  const scatterPoints: ScatterPoint[] = ROWS.map((r) => ({
    workload: r.workload,
    kernel: r.kernel,
    x: r.dramRatio,
    y: r.speedup,
    nOk: r.nOk,
  }));

  const speedSorted = [...ROWS].sort((a, b) => b.speedup - a.speedup);
  const best = speedSorted[0];
  const worst = speedSorted[speedSorted.length - 1];

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={6}>
        <H1>HWPF on vs off — small SNAP graphs (5-run DRAM difference)</H1>
        <Text tone="secondary">
          Source: `gap/output_small_graphs.tgz` with 5 attempts per workload
          (`*_1`…`*_5`). Kernel DRAM = full − `*_2rd` per attempt; attempts
          with non-positive kernel DRAM are dropped; remaining attempts are
          mean-averaged. Speedup = mean wo time / mean w time. DRAM ratio =
          mean w kernel DRAM / mean wo kernel DRAM. All `tc-*` failed
          (directed graphs) and are excluded.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat
          value={`${fmt(geoSpeedup)}x`}
          label="Geomean speedup vs wo_hwpf"
          tone={geoSpeedup > 1 ? "success" : "danger"}
        />
        <Stat value={`${wins} / ${losses}`} label="Workloads faster / slower" />
        <Stat
          value={`${fmt(geoDram)}x`}
          label="Geomean kernel DRAM ratio"
          tone={geoDram > 1.02 ? "warning" : "success"}
        />
        <Stat value={`${ROWS.length}`} label="Workloads plotted" />
      </Grid>

      {partial.length > 0 ? (
        <Callout tone="neutral" title="Partial attempts (<5/5 usable)">
          Some short kernels still had non-positive full−2rd on some repeats;
          averages use only the valid attempts:{" "}
          {partial
            .map((r) => `\`${r.workload}\` (${r.nOk}/5)`)
            .join(", ")}
          .
        </Callout>
      ) : null}

      <Stack gap={8}>
        <H2>Kernel DRAM ratio vs speedup</H2>
        <Text size="small" tone="tertiary">
          Each point is one kernel/graph pair (5-run average). Best: `
          {best.workload}` at {fmt(best.speedup)}x. Worst: `{worst.workload}` at{" "}
          {fmt(worst.speedup)}x. Every plotted workload is above 1.0× speedup.
        </Text>
        <DramSpeedupScatter
          points={scatterPoints}
          xLabel="Kernel DRAM ratio (w_hwpf / wo_hwpf)"
          yLabel="Speedup (wo_hwpf / w_hwpf)"
        />
        <Text size="small" tone="tertiary">
          Geomean speedup {fmt(geoSpeedup)}x with geomean kernel DRAM near
          parity ({fmt(geoDram)}x). Multi-run averaging removes most of the
          single-run DRAM-ratio outliers seen previously.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Measurements (mean over valid attempts)</H2>
        <Table
          headers={[
            "Workload",
            "n/5",
            "wo time (s)",
            "w time (s)",
            "Speedup",
            "Speedup range",
            "wo kern DRAM",
            "w kern DRAM",
            "DRAM ratio",
            "DRAM range",
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
            "right",
            "right",
          ]}
          rowTone={speedSorted.map((r) =>
            r.speedup > 1 ? "success" : "danger",
          )}
          rows={speedSorted.map((r) => [
            r.workload,
            `${r.nOk}`,
            fmt(r.baseTime, 4),
            fmt(r.hwpfTime, 4),
            `${fmt(r.speedup)}x`,
            `${fmt(r.speedupMin)}–${fmt(r.speedupMax)}`,
            fmt(r.baseDram, 3),
            fmt(r.hwpfDram, 3),
            `${fmt(r.dramRatio)}x`,
            `${fmt(r.dramMin)}–${fmt(r.dramMax)}`,
          ])}
          striped
          stickyHeader
        />
      </Stack>
    </Stack>
  );
}
