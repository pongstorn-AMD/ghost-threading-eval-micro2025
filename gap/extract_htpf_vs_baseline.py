#!/usr/bin/env python3
"""Extract runtime and DRAM traffic for htpf (figure6_4) vs baseline (figure6)."""

import json
import math
import os
import re

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
BASELINE_DIR = os.path.join(BASE_DIR, "figure6")
HTPF_DIR = os.path.join(BASE_DIR, "figure6_4")

KERNELS = ["bc", "bfs", "cc", "pr", "sssp", "tc"]
GRAPHS = ["kron", "twitter", "twitterU", "urand", "road", "roadU", "web", "webU"]

AVG_TIME_RE = re.compile(r"^Average Time:\s+([0-9.]+)", re.M)
READ_TIME_RE = re.compile(r"^Read Time:\s+([0-9.]+)", re.M)
ELAPSED_RE = re.compile(r"^\s+([0-9.]+) seconds time elapsed", re.M)
IMC_RE = re.compile(r"^\s*([0-9.]+)\s+MiB\s+uncore_imc_\d+/cas_count_(read|write)/", re.M)


def parse(path):
    """Return kernel time (s), DRAM read/write (MiB), and wall-clock elapsed (s)."""
    if not os.path.isfile(path):
        return None
    with open(path) as f:
        text = f.read()

    m = AVG_TIME_RE.search(text)
    if not m:
        return None
    avg_time = float(m.group(1))
    m_rd = READ_TIME_RE.search(text)
    read_time = float(m_rd.group(1)) if m_rd else None

    read_mib = 0.0
    write_mib = 0.0
    for value, kind in IMC_RE.findall(text):
        if kind == "read":
            read_mib += float(value)
        else:
            write_mib += float(value)
    if read_mib == 0.0 and write_mib == 0.0:
        return None

    m = ELAPSED_RE.search(text)
    elapsed = float(m.group(1)) if m else None

    return {
        "avg_time_s": avg_time,
        "read_time_s": read_time,
        "dram_read_mib": read_mib,
        "dram_write_mib": write_mib,
        "dram_total_mib": read_mib + write_mib,
        "elapsed_s": elapsed,
    }


def geomean(values):
    values = [v for v in values if v and v > 0]
    if not values:
        return None
    return math.exp(sum(math.log(v) for v in values) / len(values))


rows = []
for kernel in KERNELS:
    for graph in GRAPHS:
        name = f"{kernel}-{graph}"
        base = parse(os.path.join(BASELINE_DIR, f"{name}-baseline.txt"))
        htpf = parse(os.path.join(HTPF_DIR, f"{name}-htpf.txt"))
        if base is None or htpf is None:
            continue
        # Same-directory baseline isolates the htpf effect from run-to-run
        # environment drift between the two collection campaigns.
        ctrl = parse(os.path.join(HTPF_DIR, f"{name}-baseline.txt"))

        # DRAM counters are collected system-wide over the whole run (including
        # graph read-in), so bandwidth is normalized by wall-clock elapsed time.
        def bandwidth(d):
            if d["elapsed_s"]:
                return d["dram_total_mib"] / d["elapsed_s"] / 1024.0
            return None

        # Fraction of the measured interval spent in the kernel; low values mean
        # the DRAM counters are dominated by graph read-in rather than the kernel.
        kernel_frac = (
            htpf["avg_time_s"] / htpf["elapsed_s"] if htpf["elapsed_s"] else None
        )

        # perf counts system-wide across read-in + kernel, so an unequal read
        # phase between the two runs leaks straight into the DRAM delta. Scale
        # that leak by kernel duration to grade how trustworthy the ratio is.
        read_gap = abs(htpf["read_time_s"] - base["read_time_s"])
        mean_kernel = (htpf["avg_time_s"] + base["avg_time_s"]) / 2.0
        contamination = read_gap / mean_kernel
        if contamination < 0.10:
            dram_quality = "good"
        elif contamination < 0.50:
            dram_quality = "fair"
        else:
            dram_quality = "unusable"

        row = {
            "workload": name,
            "kernel": kernel,
            "graph": graph,
            "baseline_time_s": round(base["avg_time_s"], 3),
            "htpf_time_s": round(htpf["avg_time_s"], 3),
            "speedup": round(base["avg_time_s"] / htpf["avg_time_s"], 4),
            "baseline_dram_gib": round(base["dram_total_mib"] / 1024.0, 3),
            "htpf_dram_gib": round(htpf["dram_total_mib"] / 1024.0, 3),
            "dram_ratio": round(htpf["dram_total_mib"] / base["dram_total_mib"], 4),
            "baseline_dram_read_gib": round(base["dram_read_mib"] / 1024.0, 3),
            "htpf_dram_read_gib": round(htpf["dram_read_mib"] / 1024.0, 3),
            "baseline_dram_write_gib": round(base["dram_write_mib"] / 1024.0, 3),
            "htpf_dram_write_gib": round(htpf["dram_write_mib"] / 1024.0, 3),
            "baseline_bw_gibs": round(bandwidth(base), 3) if bandwidth(base) else None,
            "htpf_bw_gibs": round(bandwidth(htpf), 3) if bandwidth(htpf) else None,
            "baseline_elapsed_s": base["elapsed_s"],
            "htpf_elapsed_s": htpf["elapsed_s"],
            "kernel_time_frac": round(kernel_frac, 4) if kernel_frac else None,
            "baseline_read_time_s": round(base["read_time_s"], 3),
            "htpf_read_time_s": round(htpf["read_time_s"], 3),
            "read_gap_over_kernel": round(contamination, 4),
            "dram_quality": dram_quality,
        }

        if ctrl is not None:
            row["ctrl_baseline_time_s"] = round(ctrl["avg_time_s"], 3)
            row["ctrl_speedup"] = round(ctrl["avg_time_s"] / htpf["avg_time_s"], 4)
            row["ctrl_baseline_dram_gib"] = round(ctrl["dram_total_mib"] / 1024.0, 3)
            row["ctrl_dram_ratio"] = round(
                htpf["dram_total_mib"] / ctrl["dram_total_mib"], 4
            )
        else:
            row["ctrl_baseline_time_s"] = None
            row["ctrl_speedup"] = None
            row["ctrl_baseline_dram_gib"] = None
            row["ctrl_dram_ratio"] = None

        rows.append(row)

clean = [r for r in rows if r["dram_quality"] != "unusable"]

summary = {
    "geomean_speedup": round(geomean([r["speedup"] for r in rows]), 4),
    "geomean_dram_ratio": round(geomean([r["dram_ratio"] for r in rows]), 4),
    "geomean_dram_ratio_clean": round(geomean([r["dram_ratio"] for r in clean]), 4),
    "geomean_ctrl_speedup": round(geomean([r["ctrl_speedup"] for r in rows]), 4),
    "geomean_ctrl_dram_ratio": round(geomean([r["ctrl_dram_ratio"] for r in rows]), 4),
    "workload_count": len(rows),
    "dram_usable_count": len(clean),
    "speedup_wins": sum(1 for r in rows if r["speedup"] > 1.0),
    "speedup_losses": sum(1 for r in rows if r["speedup"] <= 1.0),
}

out_json = os.path.join(os.path.dirname(BASE_DIR), "htpf_vs_baseline.json")
with open(out_json, "w") as f:
    json.dump({"rows": rows, "summary": summary}, f, indent=2)

cols = list(rows[0].keys())
out_csv = os.path.join(os.path.dirname(BASE_DIR), "htpf_vs_baseline.csv")
with open(out_csv, "w") as f:
    f.write(",".join(cols) + "\n")
    for r in rows:
        f.write(",".join("" if r[c] is None else str(r[c]) for c in cols) + "\n")

print(f"{'workload':<15}{'base(s)':>9}{'htpf(s)':>9}{'spdup':>7}{'ctrlSp':>8}"
      f"{'baseDRAM':>10}{'htpfDRAM':>10}{'ratio':>7}{'ctrlR':>7}{'dramQ':>10}")
for r in rows:
    print(f"{r['workload']:<15}{r['baseline_time_s']:>9.2f}{r['htpf_time_s']:>9.2f}"
          f"{r['speedup']:>7.3f}{r['ctrl_speedup']:>8.3f}"
          f"{r['baseline_dram_gib']:>10.1f}{r['htpf_dram_gib']:>10.1f}"
          f"{r['dram_ratio']:>7.3f}{r['ctrl_dram_ratio']:>7.3f}"
          f"{r['dram_quality']:>10}")
print()
print(f"geomean speedup vs figure6 baseline       = {summary['geomean_speedup']}")
print(f"geomean speedup vs figure6_4 baseline     = {summary['geomean_ctrl_speedup']}")
print(f"geomean DRAM ratio vs figure6 baseline    = {summary['geomean_dram_ratio']}")
print(f"  ... excluding unusable-DRAM workloads   = {summary['geomean_dram_ratio_clean']}")
print(f"geomean DRAM ratio vs figure6_4 baseline  = {summary['geomean_ctrl_dram_ratio']}")
print(f"workloads                                 = {summary['workload_count']}"
      f" ({summary['speedup_wins']} faster, {summary['speedup_losses']} slower)")
print(f"DRAM-usable workloads                     = {summary['dram_usable_count']}")
print(f"\nwrote {out_csv}\nwrote {out_json}")
