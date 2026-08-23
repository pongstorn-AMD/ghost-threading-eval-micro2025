import {
  Callout,
  Divider,
  Grid,
  H1,
  H2,
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

type ConfigId = "hwpf" | "swpf" | "htpf" | "swpf-hwpf" | "htpf-hwpf";

type Measurement = {
  workload: string;
  kernel: string;
  config: ConfigId;
  nOk: number;
  baseTime: number;
  methTime: number;
  speedup: number;
  baseDram: number;
  methDram: number;
  dramRatio: number;
  speedupMin: number;
  speedupMax: number;
  dramMin: number;
  dramMax: number;
};

/**
 * Source: gap/output_gt_spd_traffic.tgz, attempts 1–4.
 * Baseline: wo_hwpf *-baseline Average Time.
 * hwpf: w_hwpf *-baseline.
 * swpf / htpf: wo_hwpf *-swpf / *-htpf.
 * swpf-hwpf / htpf-hwpf: w_hwpf *-swpf / *-htpf.
 * Kernel DRAM = full IMC CAS (read+write) minus matching *_2rd_ (read-in only).
 */
const ROWS: Measurement[] = [
  { workload: "bc-kron", kernel: "bc", config: "hwpf", nOk: 4, baseTime: 92.087855, methTime: 88.706, speedup: 1.0381, baseDram: 237.5513, methDram: 248.2468, dramRatio: 1.045, speedupMin: 1.0378, speedupMax: 1.0385, dramMin: 1.0428, dramMax: 1.0487 },
  { workload: "bc-kron", kernel: "bc", config: "swpf-hwpf", nOk: 4, baseTime: 92.087855, methTime: 99.331783, speedup: 0.9271, baseDram: 237.5513, methDram: 308.0415, dramRatio: 1.2967, speedupMin: 0.9258, speedupMax: 0.9288, dramMin: 1.2945, dramMax: 1.3012 },
  { workload: "bc-kron", kernel: "bc", config: "htpf-hwpf", nOk: 4, baseTime: 92.087855, methTime: 83.27989, speedup: 1.1058, baseDram: 237.5513, methDram: 245.0852, dramRatio: 1.0317, speedupMin: 1.1039, speedupMax: 1.1079, dramMin: 1.0296, dramMax: 1.0352 },
  { workload: "bc-kron", kernel: "bc", config: "swpf", nOk: 4, baseTime: 92.087855, methTime: 100.986638, speedup: 0.9119, baseDram: 237.5513, methDram: 301.5152, dramRatio: 1.2693, speedupMin: 0.9107, speedupMax: 0.9134, dramMin: 1.2676, dramMax: 1.2713 },
  { workload: "bc-kron", kernel: "bc", config: "htpf", nOk: 4, baseTime: 92.087855, methTime: 85.12556, speedup: 1.0818, baseDram: 237.5513, methDram: 237.9745, dramRatio: 1.0018, speedupMin: 1.0788, speedupMax: 1.0851, dramMin: 1.0004, dramMax: 1.0032 },
  { workload: "bc-road", kernel: "bc", config: "hwpf", nOk: 4, baseTime: 2.05212, methTime: 1.93804, speedup: 1.0589, baseDram: 3.5924, methDram: 3.7998, dramRatio: 1.0577, speedupMin: 1.0582, speedupMax: 1.0598, dramMin: 1.0399, dramMax: 1.0669 },
  { workload: "bc-road", kernel: "bc", config: "swpf-hwpf", nOk: 4, baseTime: 2.05212, methTime: 1.998792, speedup: 1.0267, baseDram: 3.5924, methDram: 3.8157, dramRatio: 1.0621, speedupMin: 1.0169, speedupMax: 1.0312, dramMin: 1.0536, dramMax: 1.0719 },
  { workload: "bc-road", kernel: "bc", config: "htpf-hwpf", nOk: 4, baseTime: 2.05212, methTime: 2.051422, speedup: 1.0003, baseDram: 3.5924, methDram: 4.5808, dramRatio: 1.2752, speedupMin: 0.997, speedupMax: 1.0031, dramMin: 1.2648, dramMax: 1.2868 },
  { workload: "bc-road", kernel: "bc", config: "swpf", nOk: 4, baseTime: 2.05212, methTime: 2.109962, speedup: 0.9726, baseDram: 3.5924, methDram: 3.6015, dramRatio: 1.0025, speedupMin: 0.9709, speedupMax: 0.9739, dramMin: 0.9923, dramMax: 1.0076 },
  { workload: "bc-road", kernel: "bc", config: "htpf", nOk: 4, baseTime: 2.05212, methTime: 2.156962, speedup: 0.9514, baseDram: 3.5924, methDram: 4.3107, dramRatio: 1.1999, speedupMin: 0.9498, speedupMax: 0.9544, dramMin: 1.1723, dramMax: 1.2124 },
  { workload: "bc-twitter", kernel: "bc", config: "hwpf", nOk: 4, baseTime: 32.414797, methTime: 31.325552, speedup: 1.0348, baseDram: 91.8165, methDram: 109.0556, dramRatio: 1.1878, speedupMin: 1.0331, speedupMax: 1.0365, dramMin: 1.1859, dramMax: 1.1896 },
  { workload: "bc-twitter", kernel: "bc", config: "swpf-hwpf", nOk: 4, baseTime: 32.414797, methTime: 33.325412, speedup: 0.9727, baseDram: 91.8165, methDram: 122.5746, dramRatio: 1.335, speedupMin: 0.9712, speedupMax: 0.9741, dramMin: 1.3339, dramMax: 1.3366 },
  { workload: "bc-twitter", kernel: "bc", config: "htpf-hwpf", nOk: 4, baseTime: 32.414797, methTime: 30.257268, speedup: 1.0713, baseDram: 91.8165, methDram: 103.3141, dramRatio: 1.1252, speedupMin: 1.0707, speedupMax: 1.072, dramMin: 1.1226, dramMax: 1.1266 },
  { workload: "bc-twitter", kernel: "bc", config: "swpf", nOk: 4, baseTime: 32.414797, methTime: 34.038342, speedup: 0.9523, baseDram: 91.8165, methDram: 106.0194, dramRatio: 1.1547, speedupMin: 0.9518, speedupMax: 0.9528, dramMin: 1.1526, dramMax: 1.1575 },
  { workload: "bc-twitter", kernel: "bc", config: "htpf", nOk: 4, baseTime: 32.414797, methTime: 30.92757, speedup: 1.0481, baseDram: 91.8165, methDram: 90.2047, dramRatio: 0.9824, speedupMin: 1.0474, speedupMax: 1.0495, dramMin: 0.9785, dramMax: 0.9854 },
  { workload: "bc-urand", kernel: "bc", config: "hwpf", nOk: 4, baseTime: 157.514782, methTime: 157.89573, speedup: 0.9976, baseDram: 510.4669, methDram: 530.6356, dramRatio: 1.0395, speedupMin: 0.9963, speedupMax: 0.9985, dramMin: 1.0382, dramMax: 1.0417 },
  { workload: "bc-urand", kernel: "bc", config: "swpf-hwpf", nOk: 4, baseTime: 157.514782, methTime: 166.872343, speedup: 0.9439, baseDram: 510.4669, methDram: 530.9692, dramRatio: 1.0402, speedupMin: 0.9424, speedupMax: 0.9454, dramMin: 1.0391, dramMax: 1.0423 },
  { workload: "bc-urand", kernel: "bc", config: "htpf-hwpf", nOk: 4, baseTime: 157.514782, methTime: 143.83314, speedup: 1.0951, baseDram: 510.4669, methDram: 517.0208, dramRatio: 1.0128, speedupMin: 1.0943, speedupMax: 1.096, dramMin: 1.0115, dramMax: 1.0152 },
  { workload: "bc-urand", kernel: "bc", config: "swpf", nOk: 4, baseTime: 157.514782, methTime: 166.470943, speedup: 0.9462, baseDram: 510.4669, methDram: 512.916, dramRatio: 1.0048, speedupMin: 0.945, speedupMax: 0.9477, dramMin: 1.001, dramMax: 1.0151 },
  { workload: "bc-urand", kernel: "bc", config: "htpf", nOk: 4, baseTime: 157.514782, methTime: 144.259583, speedup: 1.0919, baseDram: 510.4669, methDram: 507.8013, dramRatio: 0.9948, speedupMin: 1.0915, speedupMax: 1.0923, dramMin: 0.9947, dramMax: 0.9949 },
  { workload: "bc-web", kernel: "bc", config: "hwpf", nOk: 4, baseTime: 12.92542, methTime: 10.240118, speedup: 1.2622, baseDram: 26.4499, methDram: 31.0331, dramRatio: 1.1733, speedupMin: 1.2576, speedupMax: 1.2692, dramMin: 1.1703, dramMax: 1.1781 },
  { workload: "bc-web", kernel: "bc", config: "swpf-hwpf", nOk: 4, baseTime: 12.92542, methTime: 11.867365, speedup: 1.0892, baseDram: 26.4499, methDram: 35.4804, dramRatio: 1.3414, speedupMin: 1.0844, speedupMax: 1.0955, dramMin: 1.3349, dramMax: 1.3505 },
  { workload: "bc-web", kernel: "bc", config: "htpf-hwpf", nOk: 4, baseTime: 12.92542, methTime: 12.264292, speedup: 1.0539, baseDram: 26.4499, methDram: 34.4312, dramRatio: 1.3018, speedupMin: 1.0494, speedupMax: 1.0598, dramMin: 1.2966, dramMax: 1.3073 },
  { workload: "bc-web", kernel: "bc", config: "swpf", nOk: 4, baseTime: 12.92542, methTime: 15.12936, speedup: 0.8543, baseDram: 26.4499, methDram: 29.7859, dramRatio: 1.1261, speedupMin: 0.853, speedupMax: 0.8563, dramMin: 1.1226, dramMax: 1.1292 },
  { workload: "bc-web", kernel: "bc", config: "htpf", nOk: 4, baseTime: 12.92542, methTime: 14.664075, speedup: 0.8814, baseDram: 26.4499, methDram: 28.851, dramRatio: 1.0908, speedupMin: 0.8812, speedupMax: 0.8818, dramMin: 1.0851, dramMax: 1.0933 },
  { workload: "bfs-kron", kernel: "bfs", config: "hwpf", nOk: 4, baseTime: 4.88647, methTime: 4.097182, speedup: 1.1926, baseDram: 14.0427, methDram: 15.8719, dramRatio: 1.1303, speedupMin: 1.185, speedupMax: 1.1956, dramMin: 1.1274, dramMax: 1.1314 },
  { workload: "bfs-kron", kernel: "bfs", config: "swpf-hwpf", nOk: 4, baseTime: 4.88647, methTime: 3.869738, speedup: 1.2627, baseDram: 14.0427, methDram: 15.264, dramRatio: 1.087, speedupMin: 1.2557, speedupMax: 1.2668, dramMin: 1.0838, dramMax: 1.0899 },
  { workload: "bfs-kron", kernel: "bfs", config: "htpf-hwpf", nOk: 4, baseTime: 4.88647, methTime: 3.299968, speedup: 1.4808, baseDram: 14.0427, methDram: 15.0289, dramRatio: 1.0702, speedupMin: 1.4733, speedupMax: 1.4858, dramMin: 1.0643, dramMax: 1.0769 },
  { workload: "bfs-kron", kernel: "bfs", config: "swpf", nOk: 4, baseTime: 4.88647, methTime: 4.674505, speedup: 1.0453, baseDram: 14.0427, methDram: 14.0173, dramRatio: 0.9982, speedupMin: 1.0445, speedupMax: 1.046, dramMin: 0.9943, dramMax: 1.0016 },
  { workload: "bfs-kron", kernel: "bfs", config: "htpf", nOk: 4, baseTime: 4.88647, methTime: 3.95415, speedup: 1.2358, baseDram: 14.0427, methDram: 13.9985, dramRatio: 0.9969, speedupMin: 1.2308, speedupMax: 1.2419, dramMin: 0.9926, dramMax: 1.0021 },
  { workload: "bfs-road", kernel: "bfs", config: "hwpf", nOk: 4, baseTime: 1.120045, methTime: 0.929945, speedup: 1.2044, baseDram: 1.5508, methDram: 1.6406, dramRatio: 1.0579, speedupMin: 1.1956, speedupMax: 1.2138, dramMin: 1.0363, dramMax: 1.0724 },
  { workload: "bfs-road", kernel: "bfs", config: "swpf-hwpf", nOk: 4, baseTime: 1.120045, methTime: 0.97383, speedup: 1.1501, baseDram: 1.5508, methDram: 1.6455, dramRatio: 1.0611, speedupMin: 1.1429, speedupMax: 1.1628, dramMin: 1.0493, dramMax: 1.0753 },
  { workload: "bfs-road", kernel: "bfs", config: "htpf-hwpf", nOk: 4, baseTime: 1.120045, methTime: 1.19857, speedup: 0.9345, baseDram: 1.5508, methDram: 1.9069, dramRatio: 1.2296, speedupMin: 0.9262, speedupMax: 0.949, dramMin: 1.2027, dramMax: 1.2503 },
  { workload: "bfs-road", kernel: "bfs", config: "swpf", nOk: 4, baseTime: 1.120045, methTime: 1.15828, speedup: 0.967, baseDram: 1.5508, methDram: 1.5605, dramRatio: 1.0063, speedupMin: 0.9584, speedupMax: 0.9714, dramMin: 0.992, dramMax: 1.0185 },
  { workload: "bfs-road", kernel: "bfs", config: "htpf", nOk: 4, baseTime: 1.120045, methTime: 1.343752, speedup: 0.8335, baseDram: 1.5508, methDram: 1.8162, dramRatio: 1.1711, speedupMin: 0.8247, speedupMax: 0.8489, dramMin: 1.1438, dramMax: 1.2001 },
  { workload: "bfs-twitter", kernel: "bfs", config: "hwpf", nOk: 4, baseTime: 3.21631, methTime: 2.576078, speedup: 1.2485, baseDram: 8.0644, methDram: 9.4227, dramRatio: 1.1684, speedupMin: 1.2317, speedupMax: 1.257, dramMin: 1.1608, dramMax: 1.1772 },
  { workload: "bfs-twitter", kernel: "bfs", config: "swpf-hwpf", nOk: 4, baseTime: 3.21631, methTime: 2.650643, speedup: 1.2134, baseDram: 8.0644, methDram: 9.5569, dramRatio: 1.1851, speedupMin: 1.202, speedupMax: 1.2192, dramMin: 1.1698, dramMax: 1.1953 },
  { workload: "bfs-twitter", kernel: "bfs", config: "htpf-hwpf", nOk: 4, baseTime: 3.21631, methTime: 1.916285, speedup: 1.6784, baseDram: 8.0644, methDram: 9.2038, dramRatio: 1.1413, speedupMin: 1.6602, speedupMax: 1.688, dramMin: 1.1345, dramMax: 1.1555 },
  { workload: "bfs-twitter", kernel: "bfs", config: "swpf", nOk: 4, baseTime: 3.21631, methTime: 3.31715, speedup: 0.9696, baseDram: 8.0644, methDram: 8.1991, dramRatio: 1.0167, speedupMin: 0.9643, speedupMax: 0.9722, dramMin: 1.0094, dramMax: 1.0317 },
  { workload: "bfs-twitter", kernel: "bfs", config: "htpf", nOk: 4, baseTime: 3.21631, methTime: 2.358717, speedup: 1.3636, baseDram: 8.0644, methDram: 7.9093, dramRatio: 0.9808, speedupMin: 1.356, speedupMax: 1.3717, dramMin: 0.9657, dramMax: 1.0005 },
  { workload: "bfs-urand", kernel: "bfs", config: "hwpf", nOk: 4, baseTime: 12.929177, methTime: 10.895902, speedup: 1.1866, baseDram: 25.7941, methDram: 26.1185, dramRatio: 1.0126, speedupMin: 1.1811, speedupMax: 1.191, dramMin: 1.0103, dramMax: 1.0165 },
  { workload: "bfs-urand", kernel: "bfs", config: "swpf-hwpf", nOk: 4, baseTime: 12.929177, methTime: 11.297995, speedup: 1.1444, baseDram: 25.7941, methDram: 26.0603, dramRatio: 1.0103, speedupMin: 1.1385, speedupMax: 1.147, dramMin: 1.009, dramMax: 1.0117 },
  { workload: "bfs-urand", kernel: "bfs", config: "htpf-hwpf", nOk: 4, baseTime: 12.929177, methTime: 9.375088, speedup: 1.3791, baseDram: 25.7941, methDram: 25.2911, dramRatio: 0.9805, speedupMin: 1.3739, speedupMax: 1.3842, dramMin: 0.9775, dramMax: 0.9838 },
  { workload: "bfs-urand", kernel: "bfs", config: "swpf", nOk: 4, baseTime: 12.929177, methTime: 13.455262, speedup: 0.9609, baseDram: 25.7941, methDram: 25.815, dramRatio: 1.0008, speedupMin: 0.9603, speedupMax: 0.9619, dramMin: 1.0, dramMax: 1.0015 },
  { workload: "bfs-urand", kernel: "bfs", config: "htpf", nOk: 4, baseTime: 12.929177, methTime: 10.144627, speedup: 1.2745, baseDram: 25.7941, methDram: 25.0465, dramRatio: 0.971, speedupMin: 1.2715, speedupMax: 1.279, dramMin: 0.9689, dramMax: 0.9726 },
  { workload: "bfs-web", kernel: "bfs", config: "hwpf", nOk: 4, baseTime: 10.064042, methTime: 4.661433, speedup: 2.159, baseDram: 20.0197, methDram: 21.4772, dramRatio: 1.0728, speedupMin: 2.105, speedupMax: 2.2304, dramMin: 1.0694, dramMax: 1.0748 },
  { workload: "bfs-web", kernel: "bfs", config: "swpf-hwpf", nOk: 4, baseTime: 10.064042, methTime: 5.219485, speedup: 1.9282, baseDram: 20.0197, methDram: 21.622, dramRatio: 1.08, speedupMin: 1.8813, speedupMax: 1.9891, dramMin: 1.0773, dramMax: 1.0857 },
  { workload: "bfs-web", kernel: "bfs", config: "htpf-hwpf", nOk: 4, baseTime: 10.064042, methTime: 4.08283, speedup: 2.465, baseDram: 20.0197, methDram: 21.6715, dramRatio: 1.0825, speedupMin: 2.4051, speedupMax: 2.5449, dramMin: 1.0798, dramMax: 1.086 },
  { workload: "bfs-web", kernel: "bfs", config: "swpf", nOk: 4, baseTime: 10.064042, methTime: 10.865008, speedup: 0.9263, baseDram: 20.0197, methDram: 20.1032, dramRatio: 1.0042, speedupMin: 0.92, speedupMax: 0.9331, dramMin: 1.0014, dramMax: 1.0059 },
  { workload: "bfs-web", kernel: "bfs", config: "htpf", nOk: 4, baseTime: 10.064042, methTime: 7.894802, speedup: 1.2748, baseDram: 20.0197, methDram: 19.8362, dramRatio: 0.9908, speedupMin: 1.2607, speedupMax: 1.2972, dramMin: 0.9867, dramMax: 0.9934 },
  { workload: "cc-kron", kernel: "cc", config: "hwpf", nOk: 4, baseTime: 8.759898, methTime: 7.980795, speedup: 1.0976, baseDram: 16.9904, methDram: 19.7688, dramRatio: 1.1635, speedupMin: 1.0954, speedupMax: 1.0994, dramMin: 1.1376, dramMax: 1.1813 },
  { workload: "cc-kron", kernel: "cc", config: "swpf-hwpf", nOk: 4, baseTime: 8.759898, methTime: 8.043535, speedup: 1.0891, baseDram: 16.9904, methDram: 22.1668, dramRatio: 1.3047, speedupMin: 1.0878, speedupMax: 1.0901, dramMin: 1.299, dramMax: 1.312 },
  { workload: "cc-kron", kernel: "cc", config: "htpf-hwpf", nOk: 4, baseTime: 8.759898, methTime: 6.893912, speedup: 1.2707, baseDram: 16.9904, methDram: 19.52, dramRatio: 1.1489, speedupMin: 1.27, speedupMax: 1.2721, dramMin: 1.1409, dramMax: 1.1596 },
  { workload: "cc-kron", kernel: "cc", config: "swpf", nOk: 4, baseTime: 8.759898, methTime: 8.947458, speedup: 0.979, baseDram: 16.9904, methDram: 18.6557, dramRatio: 1.098, speedupMin: 0.9784, speedupMax: 0.9796, dramMin: 1.0895, dramMax: 1.1102 },
  { workload: "cc-kron", kernel: "cc", config: "htpf", nOk: 4, baseTime: 8.759898, methTime: 7.646935, speedup: 1.1455, baseDram: 16.9904, methDram: 17.1507, dramRatio: 1.0094, speedupMin: 1.1435, speedupMax: 1.1467, dramMin: 1.0043, dramMax: 1.0187 },
  { workload: "cc-road", kernel: "cc", config: "hwpf", nOk: 4, baseTime: 0.974315, methTime: 0.6443, speedup: 1.5122, baseDram: 1.877, methDram: 2.0834, dramRatio: 1.1099, speedupMin: 1.506, speedupMax: 1.5211, dramMin: 1.0697, dramMax: 1.1517 },
  { workload: "cc-road", kernel: "cc", config: "swpf-hwpf", nOk: 4, baseTime: 0.974315, methTime: 0.65182, speedup: 1.4948, baseDram: 1.877, methDram: 2.1049, dramRatio: 1.1214, speedupMin: 1.4901, speedupMax: 1.5017, dramMin: 1.0913, dramMax: 1.176 },
  { workload: "cc-road", kernel: "cc", config: "htpf-hwpf", nOk: 4, baseTime: 0.974315, methTime: 0.646665, speedup: 1.5067, baseDram: 1.877, methDram: 2.1391, dramRatio: 1.1396, speedupMin: 1.4986, speedupMax: 1.5186, dramMin: 1.1234, dramMax: 1.1565 },
  { workload: "cc-road", kernel: "cc", config: "swpf", nOk: 4, baseTime: 0.974315, methTime: 0.99189, speedup: 0.9823, baseDram: 1.877, methDram: 1.8835, dramRatio: 1.0034, speedupMin: 0.9752, speedupMax: 0.9896, dramMin: 0.9872, dramMax: 1.0202 },
  { workload: "cc-road", kernel: "cc", config: "htpf", nOk: 4, baseTime: 0.974315, methTime: 0.83785, speedup: 1.1629, baseDram: 1.877, methDram: 1.9311, dramRatio: 1.0288, speedupMin: 1.1589, speedupMax: 1.1667, dramMin: 0.9927, dramMax: 1.084 },
  { workload: "cc-twitter", kernel: "cc", config: "hwpf", nOk: 4, baseTime: 3.2021, methTime: 2.647137, speedup: 1.2096, baseDram: 8.8161, methDram: 11.787, dramRatio: 1.337, speedupMin: 1.1661, speedupMax: 1.228, dramMin: 1.143, dramMax: 1.8949 },
  { workload: "cc-twitter", kernel: "cc", config: "swpf-hwpf", nOk: 4, baseTime: 3.2021, methTime: 2.685993, speedup: 1.1921, baseDram: 8.8161, methDram: 10.6509, dramRatio: 1.2081, speedupMin: 1.1902, speedupMax: 1.1952, dramMin: 1.1912, dramMax: 1.23 },
  { workload: "cc-twitter", kernel: "cc", config: "htpf-hwpf", nOk: 4, baseTime: 3.2021, methTime: 2.430087, speedup: 1.3177, baseDram: 8.8161, methDram: 10.2133, dramRatio: 1.1585, speedupMin: 1.315, speedupMax: 1.3209, dramMin: 1.1502, dramMax: 1.1709 },
  { workload: "cc-twitter", kernel: "cc", config: "swpf", nOk: 4, baseTime: 3.2021, methTime: 3.314423, speedup: 0.9661, baseDram: 8.8161, methDram: 9.2132, dramRatio: 1.045, speedupMin: 0.965, speedupMax: 0.9672, dramMin: 1.0356, dramMax: 1.0501 },
  { workload: "cc-twitter", kernel: "cc", config: "htpf", nOk: 4, baseTime: 3.2021, methTime: 3.10738, speedup: 1.0305, baseDram: 8.8161, methDram: 9.0377, dramRatio: 1.0251, speedupMin: 1.0294, speedupMax: 1.0311, dramMin: 1.0181, dramMax: 1.038 },
  { workload: "cc-urand", kernel: "cc", config: "hwpf", nOk: 4, baseTime: 34.323403, methTime: 30.080272, speedup: 1.1411, baseDram: 28.2181, methDram: 37.4135, dramRatio: 1.3259, speedupMin: 1.1384, speedupMax: 1.146, dramMin: 1.3217, dramMax: 1.3339 },
  { workload: "cc-urand", kernel: "cc", config: "swpf-hwpf", nOk: 4, baseTime: 34.323403, methTime: 29.827622, speedup: 1.1507, baseDram: 28.2181, methDram: 37.2932, dramRatio: 1.3216, speedupMin: 1.1455, speedupMax: 1.155, dramMin: 1.3165, dramMax: 1.3303 },
  { workload: "cc-urand", kernel: "cc", config: "htpf-hwpf", nOk: 4, baseTime: 34.323403, methTime: 18.415305, speedup: 1.8639, baseDram: 28.2181, methDram: 36.4906, dramRatio: 1.2932, speedupMin: 1.8564, speedupMax: 1.8688, dramMin: 1.2888, dramMax: 1.2987 },
  { workload: "cc-urand", kernel: "cc", config: "swpf", nOk: 4, baseTime: 34.323403, methTime: 34.10978, speedup: 1.0063, baseDram: 28.2181, methDram: 28.2226, dramRatio: 1.0002, speedupMin: 1.0047, speedupMax: 1.0089, dramMin: 0.9979, dramMax: 1.0016 },
  { workload: "cc-urand", kernel: "cc", config: "htpf", nOk: 4, baseTime: 34.323403, methTime: 19.85781, speedup: 1.7285, baseDram: 28.2181, methDram: 27.1538, dramRatio: 0.9623, speedupMin: 1.7269, speedupMax: 1.7298, dramMin: 0.9611, dramMax: 0.9637 },
  { workload: "cc-web", kernel: "cc", config: "hwpf", nOk: 4, baseTime: 3.302732, methTime: 2.069247, speedup: 1.5961, baseDram: 8.825, methDram: 13.0876, dramRatio: 1.483, speedupMin: 1.5804, speedupMax: 1.6158, dramMin: 1.4477, dramMax: 1.5136 },
  { workload: "cc-web", kernel: "cc", config: "swpf-hwpf", nOk: 4, baseTime: 3.302732, methTime: 2.209783, speedup: 1.4946, baseDram: 8.825, methDram: 15.9084, dramRatio: 1.8027, speedupMin: 1.4832, speedupMax: 1.5083, dramMin: 1.7757, dramMax: 1.8452 },
  { workload: "cc-web", kernel: "cc", config: "htpf-hwpf", nOk: 4, baseTime: 3.302732, methTime: 1.68306, speedup: 1.9623, baseDram: 8.825, methDram: 11.8206, dramRatio: 1.3394, speedupMin: 1.9499, speedupMax: 1.9744, dramMin: 1.3066, dramMax: 1.3721 },
  { workload: "cc-web", kernel: "cc", config: "swpf", nOk: 4, baseTime: 3.302732, methTime: 3.649495, speedup: 0.905, baseDram: 8.825, methDram: 11.2115, dramRatio: 1.2704, speedupMin: 0.9011, speedupMax: 0.909, dramMin: 1.2493, dramMax: 1.3014 },
  { workload: "cc-web", kernel: "cc", config: "htpf", nOk: 4, baseTime: 3.302732, methTime: 2.834338, speedup: 1.1653, baseDram: 8.825, methDram: 8.7648, dramRatio: 0.9932, speedupMin: 1.1545, speedupMax: 1.1725, dramMin: 0.9644, dramMax: 1.0172 },
  { workload: "pr-kron", kernel: "pr", config: "hwpf", nOk: 4, baseTime: 162.046198, methTime: 158.41962, speedup: 1.0229, baseDram: 491.5655, methDram: 492.1456, dramRatio: 1.0012, speedupMin: 1.0162, speedupMax: 1.0286, dramMin: 0.9959, dramMax: 1.0044 },
  { workload: "pr-kron", kernel: "pr", config: "swpf-hwpf", nOk: 4, baseTime: 162.046198, methTime: 158.281378, speedup: 1.0238, baseDram: 491.5655, methDram: 491.8942, dramRatio: 1.0007, speedupMin: 1.0222, speedupMax: 1.0278, dramMin: 0.995, dramMax: 1.004 },
  { workload: "pr-kron", kernel: "pr", config: "htpf-hwpf", nOk: 4, baseTime: 162.046198, methTime: 216.86355, speedup: 0.7472, baseDram: 491.5655, methDram: 484.3802, dramRatio: 0.9854, speedupMin: 0.7447, speedupMax: 0.7507, dramMin: 0.9797, dramMax: 0.9897 },
  { workload: "pr-kron", kernel: "pr", config: "swpf", nOk: 4, baseTime: 162.046198, methTime: 162.57217, speedup: 0.9968, baseDram: 491.5655, methDram: 491.5117, dramRatio: 0.9999, speedupMin: 0.9929, speedupMax: 1.0027, dramMin: 0.9976, dramMax: 1.0008 },
  { workload: "pr-kron", kernel: "pr", config: "htpf", nOk: 4, baseTime: 162.046198, methTime: 224.10738, speedup: 0.7231, baseDram: 491.5655, methDram: 483.7571, dramRatio: 0.9841, speedupMin: 0.7222, speedupMax: 0.7241, dramMin: 0.9836, dramMax: 0.9851 },
  { workload: "pr-road", kernel: "pr", config: "hwpf", nOk: 4, baseTime: 5.821867, methTime: 3.375093, speedup: 1.725, baseDram: 19.2479, methDram: 19.0823, dramRatio: 0.9914, speedupMin: 1.7192, speedupMax: 1.7325, dramMin: 0.9871, dramMax: 0.9952 },
  { workload: "pr-road", kernel: "pr", config: "swpf-hwpf", nOk: 4, baseTime: 5.821867, methTime: 3.80504, speedup: 1.53, baseDram: 19.2479, methDram: 19.0834, dramRatio: 0.9915, speedupMin: 1.5239, speedupMax: 1.5363, dramMin: 0.9852, dramMax: 0.9966 },
  { workload: "pr-road", kernel: "pr", config: "htpf-hwpf", nOk: 4, baseTime: 5.821867, methTime: 4.146752, speedup: 1.404, baseDram: 19.2479, methDram: 18.6304, dramRatio: 0.9679, speedupMin: 1.3977, speedupMax: 1.4091, dramMin: 0.9618, dramMax: 0.9701 },
  { workload: "pr-road", kernel: "pr", config: "swpf", nOk: 4, baseTime: 5.821867, methTime: 6.12511, speedup: 0.9505, baseDram: 19.2479, methDram: 19.2407, dramRatio: 0.9996, speedupMin: 0.9499, speedupMax: 0.9507, dramMin: 0.9965, dramMax: 1.0028 },
  { workload: "pr-road", kernel: "pr", config: "htpf", nOk: 4, baseTime: 5.821867, methTime: 5.692885, speedup: 1.0227, baseDram: 19.2479, methDram: 18.6529, dramRatio: 0.9691, speedupMin: 1.0207, speedupMax: 1.0253, dramMin: 0.9658, dramMax: 0.9722 },
  { workload: "pr-twitter", kernel: "pr", config: "hwpf", nOk: 4, baseTime: 146.59978, methTime: 136.590595, speedup: 1.0733, baseDram: 338.7899, methDram: 342.4439, dramRatio: 1.0108, speedupMin: 1.0712, speedupMax: 1.0763, dramMin: 1.0014, dramMax: 1.0208 },
  { workload: "pr-twitter", kernel: "pr", config: "swpf-hwpf", nOk: 4, baseTime: 146.59978, methTime: 138.843895, speedup: 1.0559, baseDram: 338.7899, methDram: 343.4022, dramRatio: 1.0136, speedupMin: 1.053, speedupMax: 1.0574, dramMin: 1.0089, dramMax: 1.0188 },
  { workload: "pr-twitter", kernel: "pr", config: "htpf-hwpf", nOk: 4, baseTime: 146.59978, methTime: 188.087797, speedup: 0.7794, baseDram: 338.7899, methDram: 340.2609, dramRatio: 1.0043, speedupMin: 0.7777, speedupMax: 0.7807, dramMin: 1.0005, dramMax: 1.0076 },
  { workload: "pr-twitter", kernel: "pr", config: "swpf", nOk: 4, baseTime: 146.59978, methTime: 145.369338, speedup: 1.0085, baseDram: 338.7899, methDram: 339.8872, dramRatio: 1.0032, speedupMin: 1.0077, speedupMax: 1.0104, dramMin: 1.0, dramMax: 1.0085 },
  { workload: "pr-twitter", kernel: "pr", config: "htpf", nOk: 4, baseTime: 146.59978, methTime: 190.856762, speedup: 0.7681, baseDram: 338.7899, methDram: 336.318, dramRatio: 0.9927, speedupMin: 0.7674, speedupMax: 0.7688, dramMin: 0.9904, dramMax: 0.9958 },
  { workload: "pr-urand", kernel: "pr", config: "hwpf", nOk: 4, baseTime: 196.050318, methTime: 195.465562, speedup: 1.003, baseDram: 920.2745, methDram: 920.8308, dramRatio: 1.0006, speedupMin: 1.001, speedupMax: 1.0067, dramMin: 0.9991, dramMax: 1.0027 },
  { workload: "pr-urand", kernel: "pr", config: "swpf-hwpf", nOk: 4, baseTime: 196.050318, methTime: 192.778063, speedup: 1.017, baseDram: 920.2745, methDram: 920.5787, dramRatio: 1.0003, speedupMin: 1.0119, speedupMax: 1.021, dramMin: 0.9987, dramMax: 1.0024 },
  { workload: "pr-urand", kernel: "pr", config: "htpf-hwpf", nOk: 4, baseTime: 196.050318, methTime: 241.70776, speedup: 0.8111, baseDram: 920.2745, methDram: 923.1304, dramRatio: 1.0031, speedupMin: 0.8065, speedupMax: 0.813, dramMin: 1.0009, dramMax: 1.0052 },
  { workload: "pr-urand", kernel: "pr", config: "swpf", nOk: 4, baseTime: 196.050318, methTime: 194.297655, speedup: 1.009, baseDram: 920.2745, methDram: 919.4641, dramRatio: 0.9991, speedupMin: 1.0057, speedupMax: 1.0132, dramMin: 0.9974, dramMax: 0.9998 },
  { workload: "pr-urand", kernel: "pr", config: "htpf", nOk: 4, baseTime: 196.050318, methTime: 242.332925, speedup: 0.809, baseDram: 920.2745, methDram: 922.8629, dramRatio: 1.0028, speedupMin: 0.8077, speedupMax: 0.8103, dramMin: 1.0024, dramMax: 1.0033 },
  { workload: "pr-web", kernel: "pr", config: "hwpf", nOk: 4, baseTime: 90.18854, methTime: 31.60504, speedup: 2.8536, baseDram: 169.8231, methDram: 166.5979, dramRatio: 0.981, speedupMin: 2.823, speedupMax: 2.9122, dramMin: 0.9775, dramMax: 0.9837 },
  { workload: "pr-web", kernel: "pr", config: "swpf-hwpf", nOk: 4, baseTime: 90.18854, methTime: 35.154092, speedup: 2.5655, baseDram: 169.8231, methDram: 166.9708, dramRatio: 0.9832, speedupMin: 2.5375, speedupMax: 2.62, dramMin: 0.9806, dramMax: 0.9856 },
  { workload: "pr-web", kernel: "pr", config: "htpf-hwpf", nOk: 4, baseTime: 90.18854, methTime: 41.537183, speedup: 2.1713, baseDram: 169.8231, methDram: 193.9897, dramRatio: 1.1423, speedupMin: 2.1107, speedupMax: 2.2394, dramMin: 1.1276, dramMax: 1.1557 },
  { workload: "pr-web", kernel: "pr", config: "swpf", nOk: 4, baseTime: 90.18854, methTime: 84.827715, speedup: 1.0632, baseDram: 169.8231, methDram: 169.5799, dramRatio: 0.9986, speedupMin: 1.0395, speedupMax: 1.0818, dramMin: 0.9982, dramMax: 0.9995 },
  { workload: "pr-web", kernel: "pr", config: "htpf", nOk: 4, baseTime: 90.18854, methTime: 92.36721, speedup: 0.9764, baseDram: 169.8231, methDram: 190.6064, dramRatio: 1.1224, speedupMin: 0.9645, speedupMax: 0.9884, dramMin: 1.1205, dramMax: 1.1236 },
  { workload: "sssp-kron", kernel: "sssp", config: "hwpf", nOk: 4, baseTime: 59.74734, methTime: 58.69888, speedup: 1.0179, baseDram: 157.5506, methDram: 164.0117, dramRatio: 1.041, speedupMin: 1.0154, speedupMax: 1.0193, dramMin: 1.0342, dramMax: 1.0534 },
  { workload: "sssp-kron", kernel: "sssp", config: "swpf-hwpf", nOk: 4, baseTime: 59.74734, methTime: 51.153565, speedup: 1.168, baseDram: 157.5506, methDram: 161.7232, dramRatio: 1.0265, speedupMin: 1.163, speedupMax: 1.1744, dramMin: 1.0193, dramMax: 1.0379 },
  { workload: "sssp-kron", kernel: "sssp", config: "htpf-hwpf", nOk: 4, baseTime: 59.74734, methTime: 55.685265, speedup: 1.0729, baseDram: 157.5506, methDram: 158.8005, dramRatio: 1.0079, speedupMin: 1.0681, speedupMax: 1.0763, dramMin: 1.0021, dramMax: 1.018 },
  { workload: "sssp-kron", kernel: "sssp", config: "swpf", nOk: 4, baseTime: 59.74734, methTime: 52.36803, speedup: 1.1409, baseDram: 157.5506, methDram: 156.2955, dramRatio: 0.992, speedupMin: 1.1388, speedupMax: 1.1439, dramMin: 0.9837, dramMax: 0.9958 },
  { workload: "sssp-kron", kernel: "sssp", config: "htpf", nOk: 4, baseTime: 59.74734, methTime: 57.69179, speedup: 1.0356, baseDram: 157.5506, methDram: 155.1982, dramRatio: 0.9851, speedupMin: 1.03, speedupMax: 1.0392, dramMin: 0.9763, dramMax: 0.9903 },
  { workload: "sssp-road", kernel: "sssp", config: "hwpf", nOk: 4, baseTime: 6.271357, methTime: 5.351465, speedup: 1.1719, baseDram: 11.5759, methDram: 11.6653, dramRatio: 1.0077, speedupMin: 1.1697, speedupMax: 1.1739, dramMin: 0.9981, dramMax: 1.0141 },
  { workload: "sssp-road", kernel: "sssp", config: "swpf-hwpf", nOk: 4, baseTime: 6.271357, methTime: 5.356858, speedup: 1.1707, baseDram: 11.5759, methDram: 11.7064, dramRatio: 1.0113, speedupMin: 1.1688, speedupMax: 1.1736, dramMin: 0.9961, dramMax: 1.0194 },
  { workload: "sssp-road", kernel: "sssp", config: "swpf", nOk: 4, baseTime: 6.271357, methTime: 6.27337, speedup: 0.9997, baseDram: 11.5759, methDram: 11.5344, dramRatio: 0.9964, speedupMin: 0.9984, speedupMax: 1.0003, dramMin: 0.9875, dramMax: 1.0027 },
  { workload: "sssp-twitter", kernel: "sssp", config: "hwpf", nOk: 4, baseTime: 21.232702, methTime: 20.33602, speedup: 1.0441, baseDram: 54.4359, methDram: 60.8839, dramRatio: 1.1185, speedupMin: 1.0423, speedupMax: 1.0456, dramMin: 1.0442, dramMax: 1.1581 },
  { workload: "sssp-twitter", kernel: "sssp", config: "swpf-hwpf", nOk: 4, baseTime: 21.232702, methTime: 18.504258, speedup: 1.1474, baseDram: 54.4359, methDram: 58.0875, dramRatio: 1.0671, speedupMin: 1.144, speedupMax: 1.1525, dramMin: 0.9962, dramMax: 1.1054 },
  { workload: "sssp-twitter", kernel: "sssp", config: "htpf-hwpf", nOk: 4, baseTime: 21.232702, methTime: 18.403037, speedup: 1.1538, baseDram: 54.4359, methDram: 55.5425, dramRatio: 1.0203, speedupMin: 1.1515, speedupMax: 1.1559, dramMin: 0.9526, dramMax: 1.059 },
  { workload: "sssp-twitter", kernel: "sssp", config: "swpf", nOk: 4, baseTime: 21.232702, methTime: 19.014225, speedup: 1.1167, baseDram: 54.4359, methDram: 53.4591, dramRatio: 0.9821, speedupMin: 1.1142, speedupMax: 1.1186, dramMin: 0.9744, dramMax: 0.9876 },
  { workload: "sssp-twitter", kernel: "sssp", config: "htpf", nOk: 4, baseTime: 21.232702, methTime: 19.62579, speedup: 1.0819, baseDram: 54.4359, methDram: 52.2755, dramRatio: 0.9603, speedupMin: 1.0806, speedupMax: 1.0837, dramMin: 0.9375, dramMax: 0.9906 },
  { workload: "sssp-urand", kernel: "sssp", config: "hwpf", nOk: 4, baseTime: 120.110528, methTime: 120.260235, speedup: 0.9988, baseDram: 352.6656, methDram: 370.8561, dramRatio: 1.0516, speedupMin: 0.9968, speedupMax: 1.0003, dramMin: 1.0416, dramMax: 1.059 },
  { workload: "sssp-urand", kernel: "sssp", config: "swpf-hwpf", nOk: 4, baseTime: 120.110528, methTime: 122.224925, speedup: 0.9827, baseDram: 352.6656, methDram: 372.0315, dramRatio: 1.0549, speedupMin: 0.9807, speedupMax: 0.9853, dramMin: 1.045, dramMax: 1.0623 },
  { workload: "sssp-urand", kernel: "sssp", config: "htpf-hwpf", nOk: 4, baseTime: 120.110528, methTime: 95.473445, speedup: 1.2581, baseDram: 352.6656, methDram: 359.019, dramRatio: 1.018, speedupMin: 1.2563, speedupMax: 1.2596, dramMin: 1.0096, dramMax: 1.0255 },
  { workload: "sssp-urand", kernel: "sssp", config: "swpf", nOk: 4, baseTime: 120.110528, methTime: 122.015452, speedup: 0.9844, baseDram: 352.6656, methDram: 354.0683, dramRatio: 1.004, speedupMin: 0.9818, speedupMax: 0.9867, dramMin: 0.9937, dramMax: 1.01 },
  { workload: "sssp-urand", kernel: "sssp", config: "htpf", nOk: 4, baseTime: 120.110528, methTime: 95.973073, speedup: 1.2515, baseDram: 352.6656, methDram: 353.8378, dramRatio: 1.0033, speedupMin: 1.2479, speedupMax: 1.2546, dramMin: 0.9958, dramMax: 1.0201 },
  { workload: "sssp-web", kernel: "sssp", config: "hwpf", nOk: 4, baseTime: 20.903533, methTime: 20.43224, speedup: 1.0231, baseDram: 36.6384, methDram: 41.3953, dramRatio: 1.1298, speedupMin: 1.0208, speedupMax: 1.0255, dramMin: 0.9481, dramMax: 1.4913 },
  { workload: "sssp-web", kernel: "sssp", config: "swpf-hwpf", nOk: 4, baseTime: 20.903533, methTime: 19.773293, speedup: 1.0572, baseDram: 36.6384, methDram: 40.9674, dramRatio: 1.1182, speedupMin: 1.0547, speedupMax: 1.061, dramMin: 0.9385, dramMax: 1.4889 },
  { workload: "sssp-web", kernel: "sssp", config: "htpf-hwpf", nOk: 4, baseTime: 20.903533, methTime: 13.96273, speedup: 1.4971, baseDram: 36.6384, methDram: 42.678, dramRatio: 1.1648, speedupMin: 1.4932, speedupMax: 1.5023, dramMin: 0.9914, dramMax: 1.5467 },
  { workload: "sssp-web", kernel: "sssp", config: "swpf", nOk: 4, baseTime: 20.903533, methTime: 20.01258, speedup: 1.0445, baseDram: 36.6384, methDram: 32.4599, dramRatio: 0.886, speedupMin: 1.0429, speedupMax: 1.0462, dramMin: 0.6537, dramMax: 1.1359 },
  { workload: "sssp-web", kernel: "sssp", config: "htpf", nOk: 3, baseTime: 20.882783, methTime: 14.615333, speedup: 1.4288, baseDram: 35.5305, methDram: 34.468, dramRatio: 0.9701, speedupMin: 1.4247, speedupMax: 1.4318, dramMin: 0.952, dramMax: 0.9862 },
  { workload: "tc-kron", kernel: "tc", config: "hwpf", nOk: 4, baseTime: 8341.41814, methTime: 6374.63743, speedup: 1.3085, baseDram: 10271.9604, methDram: 12121.5895, dramRatio: 1.1801, speedupMin: 1.2967, speedupMax: 1.3182, dramMin: 1.1755, dramMax: 1.1859 },
  { workload: "tc-kron", kernel: "tc", config: "swpf-hwpf", nOk: 4, baseTime: 8341.41814, methTime: 6300.783672, speedup: 1.3239, baseDram: 10271.9604, methDram: 12151.7832, dramRatio: 1.183, speedupMin: 1.3117, speedupMax: 1.3335, dramMin: 1.1787, dramMax: 1.1877 },
  { workload: "tc-kron", kernel: "tc", config: "htpf-hwpf", nOk: 4, baseTime: 8341.41814, methTime: 7165.58105, speedup: 1.1641, baseDram: 10271.9604, methDram: 12156.0985, dramRatio: 1.1834, speedupMin: 1.1537, speedupMax: 1.1728, dramMin: 1.1782, dramMax: 1.1875 },
  { workload: "tc-kron", kernel: "tc", config: "swpf", nOk: 4, baseTime: 8341.41814, methTime: 8281.363798, speedup: 1.0073, baseDram: 10271.9604, methDram: 10254.4175, dramRatio: 0.9983, speedupMin: 1.007, speedupMax: 1.0075, dramMin: 0.9966, dramMax: 0.9996 },
  { workload: "tc-kron", kernel: "tc", config: "htpf", nOk: 4, baseTime: 8341.41814, methTime: 9459.195885, speedup: 0.8818, baseDram: 10271.9604, methDram: 10377.4998, dramRatio: 1.0103, speedupMin: 0.8792, speedupMax: 0.8837, dramMin: 1.0087, dramMax: 1.0126 },
  { workload: "tc-roadU", kernel: "tc", config: "swpf", nOk: 4, baseTime: 0.526752, methTime: 0.52918, speedup: 0.9954, baseDram: 0.6197, methDram: 0.6574, dramRatio: 1.0608, speedupMin: 0.9933, speedupMax: 0.9975, dramMin: 1.0074, dramMax: 1.1125 },
  { workload: "tc-roadU", kernel: "tc", config: "htpf", nOk: 4, baseTime: 0.526752, methTime: 0.477997, speedup: 1.102, baseDram: 0.6197, methDram: 0.7011, dramRatio: 1.1313, speedupMin: 1.0999, speedupMax: 1.1055, dramMin: 1.1002, dramMax: 1.183 },
  { workload: "tc-twitterU", kernel: "tc", config: "swpf", nOk: 4, baseTime: 1524.003803, methTime: 1508.294445, speedup: 1.0104, baseDram: 1235.8665, methDram: 1234.0985, dramRatio: 0.9986, speedupMin: 1.0103, speedupMax: 1.0106, dramMin: 0.9965, dramMax: 0.9997 },
  { workload: "tc-twitterU", kernel: "tc", config: "htpf", nOk: 4, baseTime: 1524.003803, methTime: 1658.441348, speedup: 0.9189, baseDram: 1235.8665, methDram: 1217.1053, dramRatio: 0.9848, speedupMin: 0.9185, speedupMax: 0.9196, dramMin: 0.9821, dramMax: 0.9868 },
  { workload: "tc-urand", kernel: "tc", config: "swpf", nOk: 4, baseTime: 568.514563, methTime: 586.93755, speedup: 0.9686, baseDram: 761.1979, methDram: 766.4211, dramRatio: 1.0069, speedupMin: 0.9674, speedupMax: 0.9696, dramMin: 1.0063, dramMax: 1.0077 },
  { workload: "tc-urand", kernel: "tc", config: "htpf", nOk: 4, baseTime: 568.514563, methTime: 330.551963, speedup: 1.7199, baseDram: 761.1979, methDram: 698.8403, dramRatio: 0.9181, speedupMin: 1.7193, speedupMax: 1.7204, dramMin: 0.9175, dramMax: 0.9186 },
  { workload: "tc-webU", kernel: "tc", config: "swpf", nOk: 4, baseTime: 229.282305, methTime: 232.812432, speedup: 0.9848, baseDram: 125.6575, methDram: 126.6719, dramRatio: 1.0081, speedupMin: 0.982, speedupMax: 0.9868, dramMin: 1.0023, dramMax: 1.0139 },
  { workload: "tc-webU", kernel: "tc", config: "htpf", nOk: 4, baseTime: 229.282305, methTime: 262.46821, speedup: 0.8736, baseDram: 125.6575, methDram: 128.9804, dramRatio: 1.0264, speedupMin: 0.8727, speedupMax: 0.8746, dramMin: 1.0206, dramMax: 1.0339 },
];

const CONFIGS: ConfigId[] = ["hwpf", "swpf", "htpf", "swpf-hwpf", "htpf-hwpf"];
const KERNELS = ["bc", "bfs", "cc", "pr", "sssp", "tc"] as const;

const CONFIG_LABEL: Record<ConfigId, string> = {
  hwpf: "hwpf",
  swpf: "swpf",
  htpf: "htpf",
  "swpf-hwpf": "swpf-hwpf",
  "htpf-hwpf": "htpf-hwpf",
};

const CONFIG_COLOR: Record<ConfigId, Color> = {
  hwpf: "blue",
  swpf: "orange",
  htpf: "green",
  "swpf-hwpf": "red",
  "htpf-hwpf": "purple",
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

function DramSpeedupScatter({ points }: { points: Measurement[] }) {
  const theme = useHostTheme();
  const [hovered, setHovered] = useCanvasState<string | null>(
    "gtSpdDramScatterHover",
    null,
  );

  const width = 780;
  const height = 500;
  const pad = { top: 24, right: 28, bottom: 52, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const xs = points.map((p) => p.dramRatio);
  const ys = points.map((p) => p.speedup);
  const xMin = 0.85;
  const xMax = Math.max(1.9, ...xs) + 0.04;
  const yMin = 0.65;
  const yMax = Math.max(2.95, ...ys) + 0.05;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks = [0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8];
  const yTicks = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8];

  const active =
    points.find((p) => `${p.workload}:${p.config}` === hovered) ?? null;

  return (
    <Stack gap={10}>
      <Row gap={16} align="center" wrap>
        {CONFIGS.map((c) => (
          <span
            key={c}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Swatch color={CONFIG_COLOR[c]} />
            <Text size="small" as="span">
              {CONFIG_LABEL[c]}
            </Text>
          </span>
        ))}
        <Text size="small" tone="tertiary">
          ◆ = geometric mean of that config
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
          Kernel DRAM vs wo_hwpf baseline (x)
        </text>
        <text
          x={16}
          y={pad.top + plotH / 2}
          fill={theme.text.secondary}
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90 16 ${pad.top + plotH / 2})`}
        >
          Speedup vs wo_hwpf baseline (x)
        </text>
        {points.map((p) => {
          const color = theme.category[CONFIG_COLOR[p.config]];
          const key = `${p.workload}:${p.config}`;
          const isHover = hovered === key;
          const sameWl = hovered?.startsWith(`${p.workload}:`) ?? false;
          const dim = Boolean(hovered) && !isHover && !sameWl;
          return (
            <g
              key={key}
              onMouseEnter={() => setHovered(key)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={sx(p.dramRatio)}
                cy={sy(p.speedup)}
                r={isHover ? 7 : 5}
                fill={color}
                stroke={theme.stroke.primary}
                strokeWidth={isHover ? 1.5 : 0.6}
                opacity={dim ? 0.22 : 1}
              />
              {isHover ? (
                <text
                  x={sx(p.dramRatio) + 10}
                  y={sy(p.speedup) - 10}
                  fill={theme.text.primary}
                  fontSize={11}
                  fontWeight={590}
                >
                  {`${p.workload} ${CONFIG_LABEL[p.config]}  spd ${fmt(p.speedup)}x  dram ${fmt(p.dramRatio)}x`}
                </text>
              ) : null}
            </g>
          );
        })}
        {CONFIGS.map((c) => {
          const sub = points.filter((p) => p.config === c);
          if (sub.length === 0) return null;
          const gx = geomean(sub.map((p) => p.dramRatio));
          const gy = geomean(sub.map((p) => p.speedup));
          const color = theme.category[CONFIG_COLOR[c]];
          const cx = sx(gx);
          const cy = sy(gy);
          const r = 7;
          return (
            <polygon
              key={`geo-${c}`}
              points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
              fill={color}
              stroke={theme.text.primary}
              strokeWidth={1.4}
            />
          );
        })}
      </svg>
      {active ? (
        <Text size="small" tone="secondary">
          {active.workload} · {CONFIG_LABEL[active.config]} · speedup{" "}
          {fmt(active.speedup, 3)}x (range {fmt(active.speedupMin, 3)}–
          {fmt(active.speedupMax, 3)}) · DRAM {fmt(active.dramRatio, 3)}x (
          {fmt(active.baseDram, 1)} → {fmt(active.methDram, 1)} GiB) · n=
          {active.nOk}/4
        </Text>
      ) : (
        <Text size="small" tone="tertiary">
          Hover a point for workload, speedup, and kernel DRAM. Diamonds are
          per-config geometric means of the currently filtered points.
        </Text>
      )}
    </Stack>
  );
}

function summarize(cfg: ConfigId) {
  const sub = ROWS.filter((r) => r.config === cfg);
  return {
    n: sub.length,
    spd: geomean(sub.map((r) => r.speedup)),
    dram: geomean(sub.map((r) => r.dramRatio)),
    wins: sub.filter((r) => r.speedup > 1).length,
  };
}

export default function GtSpdVsDram() {
  const [kernelFilter, setKernelFilter] = useCanvasState<string>(
    "gtSpdDramKernel",
    "all",
  );
  const [configFilter, setConfigFilter] = useCanvasState<string>(
    "gtSpdDramConfig",
    "all",
  );

  const filtered = ROWS.filter((r) => {
    if (kernelFilter !== "all" && r.kernel !== kernelFilter) return false;
    if (configFilter !== "all" && r.config !== configFilter) return false;
    return true;
  });

  const stats = CONFIGS.map((c) => ({ id: c, ...summarize(c) }));

  const sorted = [...filtered].sort((a, b) => {
    if (a.workload === b.workload) {
      return CONFIGS.indexOf(a.config) - CONFIGS.indexOf(b.config);
    }
    return a.workload.localeCompare(b.workload);
  });

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1120 }}>
      <Stack gap={6}>
        <H1>Speedup vs kernel DRAM — GAP graphs (runs 1–4)</H1>
        <Text tone="secondary">
          Source: `gap/output_gt_spd_traffic.tgz`, attempts 1–4. Baseline is
          `wo_hwpf` `*-baseline` Average Time. Kernel DRAM is uncore IMC CAS
          read+write on the full run minus the matching `*_2rd_` read-in-only
          run. `_1rd_` directories are ignored.
        </Text>
      </Stack>

      <Grid columns={3} gap={16}>
        {stats.map((s) => (
          <Stat
            key={s.id}
            value={`${fmt(s.spd, 3)}x`}
            label={`${CONFIG_LABEL[s.id]} geomean speedup · DRAM ${fmt(s.dram, 3)}x · ${s.wins}/${s.n} faster`}
            tone={s.spd > 1 ? "success" : "danger"}
          />
        ))}
      </Grid>

      <Callout tone="neutral" title="Configs vs wo_hwpf baseline">
        hwpf = `w_hwpf` `*-baseline`. swpf / htpf = `wo_hwpf` `*-swpf` /
        `*-htpf`. swpf-hwpf / htpf-hwpf = `w_hwpf` `*-swpf` / `*-htpf`.
        Speedup = wo time / method time. DRAM ratio = method kernel DRAM / wo
        kernel DRAM. Missing: `sssp-road` htpf-hwpf and htpf. `tc-*` other than
        `tc-kron` exist only for swpf and htpf. `sssp-web` htpf uses 3 of 4
        attempts.
      </Callout>

      <Stack gap={8}>
        <H2>Kernel DRAM ratio vs speedup</H2>
        <Row gap={8} wrap>
          <Pill
            active={kernelFilter === "all"}
            onClick={() => setKernelFilter("all")}
          >
            all kernels
          </Pill>
          {KERNELS.map((k) => (
            <Pill
              key={k}
              active={kernelFilter === k}
              onClick={() => setKernelFilter(k)}
            >
              {k}
            </Pill>
          ))}
        </Row>
        <Row gap={8} wrap>
          <Pill
            active={configFilter === "all"}
            onClick={() => setConfigFilter("all")}
          >
            all configs
          </Pill>
          {CONFIGS.map((c) => (
            <Pill
              key={c}
              active={configFilter === c}
              onClick={() => setConfigFilter(c)}
            >
              {CONFIG_LABEL[c]}
            </Pill>
          ))}
        </Row>
        <DramSpeedupScatter points={filtered} />
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>Per-workload measurements (mean of valid attempts)</H2>
        <Text size="small" tone="tertiary">
          Times in seconds. DRAM in GiB after subtracting `_2rd`. n is valid
          attempts of 4.
        </Text>
        <Table
          headers={[
            "Workload",
            "Config",
            "n/4",
            "wo time (s)",
            "method time (s)",
            "Speedup",
            "Speedup range",
            "wo kern DRAM",
            "method kern DRAM",
            "DRAM ratio",
            "DRAM range",
          ]}
          columnAlign={[
            "left",
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
          rowTone={sorted.map((r) => (r.speedup > 1 ? "success" : "danger"))}
          rows={sorted.map((r) => [
            r.workload,
            CONFIG_LABEL[r.config],
            `${r.nOk}`,
            fmt(r.baseTime, 3),
            fmt(r.methTime, 3),
            `${fmt(r.speedup, 3)}x`,
            `${fmt(r.speedupMin, 3)}–${fmt(r.speedupMax, 3)}`,
            fmt(r.baseDram, 2),
            fmt(r.methDram, 2),
            `${fmt(r.dramRatio, 3)}x`,
            `${fmt(r.dramMin, 3)}–${fmt(r.dramMax, 3)}`,
          ])}
          striped
          stickyHeader
        />
      </Stack>
    </Stack>
  );
}
