#!/usr/bin/env python3
"""Extract method vs baseline metrics and scatter-plot DRAM traffic vs speedup.

Compares a method from figure6_4 against the baseline from figure6:

  baseline: gap/output/figure6/*-baseline.txt
  method:   gap/output/figure6_4/*-{htpf,swpf,homp}.txt
            gap/output/figure6_4/*-baseline.txt   (logical name: hwpf)

Speedup  = baseline Average Time / method Average Time  (kernel only)
DRAM ratio = method total CAS traffic / baseline total CAS traffic
             (system-wide over the whole process, including graph read-in)

Usage:
  python3 plot_dram_vs_speedup.py
  python3 plot_dram_vs_speedup.py --method swpf
  python3 plot_dram_vs_speedup.py --method hwpf
  python3 plot_dram_vs_speedup.py --include-unusable   # keep contaminated DRAM pairs
  python3 plot_dram_vs_speedup.py --baseline-ref figure6_4
  python3 plot_dram_vs_speedup.py --out scatter.pdf
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import re
import sys

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
FIGURE6_DIR = os.path.join(OUTPUT_DIR, "figure6")
FIGURE6_4_DIR = os.path.join(OUTPUT_DIR, "figure6_4")

KERNELS = ["bc", "bfs", "cc", "pr", "sssp", "tc"]
GRAPHS = ["kron", "twitter", "twitterU", "urand", "road", "roadU", "web", "webU"]

# Logical method name -> filename suffix under figure6_4/.
# hwpf is stored as *-baseline.txt in this campaign.
METHOD_SUFFIX = {
    "htpf": "htpf",
    "swpf": "swpf",
    "homp": "homp",
    "hwpf": "baseline",
}

AVG_TIME_RE = re.compile(r"^Average Time:\s+([0-9.]+)", re.M)
READ_TIME_RE = re.compile(r"^Read Time:\s+([0-9.]+)", re.M)
ELAPSED_RE = re.compile(r"^\s+([0-9.]+) seconds time elapsed", re.M)
IMC_RE = re.compile(
    r"^\s*([0-9.]+)\s+MiB\s+uncore_imc_\d+/cas_count_(read|write)/", re.M
)

# Distinct markers/colors per GAP kernel
KERNEL_STYLE = {
    "bc":   {"color": "#1f77b4", "marker": "o"},
    "bfs":  {"color": "#2ca02c", "marker": "s"},
    "cc":   {"color": "#17becf", "marker": "^"},
    "pr":   {"color": "#d62728", "marker": "D"},
    "sssp": {"color": "#9467bd", "marker": "P"},
    "tc":   {"color": "#ff7f0e", "marker": "X"},
}


def parse(path: str) -> dict | None:
    """Parse a single GAP run log for kernel time and DRAM traffic."""
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

    m_el = ELAPSED_RE.search(text)
    elapsed = float(m_el.group(1)) if m_el else None

    return {
        "avg_time_s": avg_time,
        "read_time_s": read_time,
        "dram_total_mib": read_mib + write_mib,
        "dram_read_mib": read_mib,
        "dram_write_mib": write_mib,
        "elapsed_s": elapsed,
    }


def dram_quality(base: dict, variant: dict) -> str:
    """Grade how trustworthy a DRAM ratio is.

    perf counts system-wide across graph read-in + kernel. If the two runs
    spent very different time in read-in relative to the kernel, the DRAM
    delta is dominated by load traffic rather than the kernel.
    """
    if base["read_time_s"] is None or variant["read_time_s"] is None:
        return "unknown"
    read_gap = abs(variant["read_time_s"] - base["read_time_s"])
    mean_kernel = (variant["avg_time_s"] + base["avg_time_s"]) / 2.0
    contamination = read_gap / mean_kernel if mean_kernel > 0 else float("inf")
    if contamination < 0.10:
        return "good"
    if contamination < 0.50:
        return "fair"
    return "unusable"


def extract(baseline_dir: str, variant_dir: str, method: str) -> list[dict]:
    """Build one row per (kernel, graph) with both baseline and method present."""
    suffix = METHOD_SUFFIX[method]
    time_key = f"{method}_time_s"
    dram_key = f"{method}_dram_gib"
    read_key = f"{method}_read_time_s"
    # When the method itself is stored as *-baseline.txt (hwpf), there is no
    # separate same-campaign control baseline.
    has_ctrl = suffix != "baseline"

    rows = []
    for kernel in KERNELS:
        for graph in GRAPHS:
            name = f"{kernel}-{graph}"
            base = parse(os.path.join(baseline_dir, f"{name}-baseline.txt"))
            variant = parse(os.path.join(variant_dir, f"{name}-{suffix}.txt"))
            if base is None or variant is None:
                continue

            row = {
                "workload": name,
                "kernel": kernel,
                "graph": graph,
                "method": method,
                "baseline_time_s": base["avg_time_s"],
                time_key: variant["avg_time_s"],
                "speedup": base["avg_time_s"] / variant["avg_time_s"],
                "baseline_dram_gib": base["dram_total_mib"] / 1024.0,
                dram_key: variant["dram_total_mib"] / 1024.0,
                "dram_ratio": variant["dram_total_mib"] / base["dram_total_mib"],
                "baseline_read_time_s": base["read_time_s"],
                read_key: variant["read_time_s"],
                "dram_quality": dram_quality(base, variant),
            }

            if has_ctrl:
                ctrl = parse(os.path.join(variant_dir, f"{name}-baseline.txt"))
            else:
                ctrl = None

            if ctrl is not None:
                row["ctrl_baseline_time_s"] = ctrl["avg_time_s"]
                row["ctrl_speedup"] = ctrl["avg_time_s"] / variant["avg_time_s"]
                row["ctrl_baseline_dram_gib"] = ctrl["dram_total_mib"] / 1024.0
                row["ctrl_dram_ratio"] = (
                    variant["dram_total_mib"] / ctrl["dram_total_mib"]
                )
            else:
                row["ctrl_baseline_time_s"] = None
                row["ctrl_speedup"] = None
                row["ctrl_baseline_dram_gib"] = None
                row["ctrl_dram_ratio"] = None
            rows.append(row)
    return rows


def geomean(values: list[float]) -> float | None:
    values = [v for v in values if v and v > 0]
    if not values:
        return None
    return math.exp(sum(math.log(v) for v in values) / len(values))


def write_csv(rows: list[dict], path: str) -> None:
    if not rows:
        return
    fields = list(rows[0].keys())
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def plot_scatter(
    rows: list[dict],
    out_path: str,
    *,
    method: str,
    use_ctrl: bool,
    hide_unusable: bool,
    annotate: bool,
) -> None:
    if hide_unusable:
        plot_rows = [r for r in rows if r["dram_quality"] != "unusable"]
    else:
        plot_rows = list(rows)

    if not plot_rows:
        raise SystemExit("No workloads left to plot after filtering.")

    speedup_key = "ctrl_speedup" if use_ctrl else "speedup"
    dram_key = "ctrl_dram_ratio" if use_ctrl else "dram_ratio"
    ref_label = (
        "figure6_4 baseline (same-campaign control)"
        if use_ctrl
        else "figure6 baseline"
    )

    fig, ax = plt.subplots(figsize=(8.5, 6.5))

    for kernel in KERNELS:
        group = [r for r in plot_rows if r["kernel"] == kernel]
        if not group:
            continue
        style = KERNEL_STYLE[kernel]
        usable = [r for r in group if r["dram_quality"] != "unusable"]
        dirty = [r for r in group if r["dram_quality"] == "unusable"]

        if usable:
            ax.scatter(
                [r[dram_key] for r in usable],
                [r[speedup_key] for r in usable],
                s=70,
                color=style["color"],
                marker=style["marker"],
                label=kernel,
                zorder=3,
                edgecolors="black",
                linewidths=0.4,
            )
        if dirty:
            # Hollow markers: DRAM contaminated by unequal graph read-in.
            ax.scatter(
                [r[dram_key] for r in dirty],
                [r[speedup_key] for r in dirty],
                s=70,
                facecolors="none",
                edgecolors=style["color"],
                marker=style["marker"],
                linewidths=1.6,
                zorder=3,
            )

    if annotate:
        for r in plot_rows:
            ax.annotate(
                r["workload"],
                (r[dram_key], r[speedup_key]),
                textcoords="offset points",
                xytext=(5, 4),
                fontsize=7,
                alpha=0.85,
            )

    # Parity crosshairs
    ax.axhline(1.0, color="0.5", linestyle="--", linewidth=1.0, zorder=1)
    ax.axvline(1.0, color="0.5", linestyle="--", linewidth=1.0, zorder=1)

    xs = [r[dram_key] for r in plot_rows]
    ys = [r[speedup_key] for r in plot_rows]
    ax.set_xlim(min(0.7, min(xs) - 0.05), max(1.55, max(xs) + 0.05))
    ax.set_ylim(min(0.6, min(ys) - 0.05), max(2.0, max(ys) + 0.05))

    ax.set_xlabel(f"DRAM traffic ratio ({method} / baseline)")
    ax.set_ylabel(f"Speedup (baseline / {method})")
    ax.set_title(
        f"{method} vs baseline — DRAM traffic vs speedup\nreference: {ref_label}"
    )
    ax.grid(True, linestyle=":", linewidth=0.6, alpha=0.7)

    # Legend: kernels + hollow = unusable
    handles, labels = ax.get_legend_handles_labels()
    if any(r["dram_quality"] == "unusable" for r in plot_rows):
        handles.append(
            Line2D(
                [0],
                [0],
                marker="o",
                color="0.3",
                markerfacecolor="none",
                markeredgewidth=1.6,
                linestyle="None",
                markersize=8,
            )
        )
        labels.append("unusable DRAM")
    ax.legend(handles, labels, title="kernel", loc="best", framealpha=0.9)

    geo_s = geomean([r[speedup_key] for r in plot_rows])
    geo_d = geomean([r[dram_key] for r in plot_rows])
    n_unusable = sum(1 for r in rows if r["dram_quality"] == "unusable")
    note = (
        f"n={len(plot_rows)}"
        f"  geomean speedup={geo_s:.3f}x"
        f"  geomean DRAM ratio={geo_d:.3f}x"
    )
    if hide_unusable and n_unusable:
        note += f"  (hid {n_unusable} unusable)"
    ax.text(
        0.02,
        0.02,
        note,
        transform=ax.transAxes,
        fontsize=8,
        va="bottom",
        ha="left",
        bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8, edgecolor="0.8"),
    )

    fig.tight_layout()
    fig.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--method",
        choices=["htpf", "swpf", "homp", "hwpf"],
        default="htpf",
        help="Method to compare against baseline (default: htpf). "
        "hwpf reads figure6_4/*-baseline.txt.",
    )
    parser.add_argument(
        "--baseline-ref",
        choices=["figure6", "figure6_4"],
        default="figure6",
        help="Which baseline to ratio against (default: figure6). "
        "figure6_4 uses the same-campaign control baseline.",
    )
    parser.add_argument(
        "--include-unusable",
        action="store_true",
        help="Keep workloads whose DRAM ratio is contaminated by "
        "unequal graph read-in times (omitted by default).",
    )
    parser.add_argument(
        "--annotate",
        action="store_true",
        help="Label every point with its workload name.",
    )
    parser.add_argument(
        "--out",
        default=None,
        help="Output image path (.png / .pdf / .svg). "
        "Default: <method>_dram_vs_speedup.png",
    )
    parser.add_argument(
        "--csv",
        default=None,
        help="CSV path for the extracted table. "
        "Default: <method>_vs_baseline.csv",
    )
    args = parser.parse_args()

    method = args.method
    out_path = args.out or os.path.join(SCRIPT_DIR, f"{method}_dram_vs_speedup.png")
    csv_path = args.csv or os.path.join(SCRIPT_DIR, f"{method}_vs_baseline.csv")

    if not os.path.isdir(FIGURE6_DIR) or not os.path.isdir(FIGURE6_4_DIR):
        print(
            f"Missing data dirs.\n  expected: {FIGURE6_DIR}\n            {FIGURE6_4_DIR}",
            file=sys.stderr,
        )
        return 1

    # Always extract against figure6 baseline for the primary columns;
    # control columns come from figure6_4's own baseline.
    rows = extract(FIGURE6_DIR, FIGURE6_4_DIR, method)
    if not rows:
        print(
            f"No overlapping baseline/{method} pairs found.",
            file=sys.stderr,
        )
        return 1

    write_csv(rows, csv_path)

    use_ctrl = args.baseline_ref == "figure6_4"
    if use_ctrl and method == "hwpf":
        print(
            "error: --baseline-ref figure6_4 is not meaningful for hwpf "
            "(hwpf IS the figure6_4 *-baseline.txt file).",
            file=sys.stderr,
        )
        return 1
    if use_ctrl and any(r["ctrl_speedup"] is None for r in rows):
        missing = [r["workload"] for r in rows if r["ctrl_speedup"] is None]
        print(
            f"warning: no figure6_4 baseline for: {', '.join(missing)}",
            file=sys.stderr,
        )
        rows = [r for r in rows if r["ctrl_speedup"] is not None]

    hide_unusable = not args.include_unusable
    omitted = [r for r in rows if r["dram_quality"] == "unusable"]

    plot_scatter(
        rows,
        out_path,
        method=method,
        use_ctrl=use_ctrl,
        hide_unusable=hide_unusable,
        annotate=args.annotate,
    )

    speedup_key = "ctrl_speedup" if use_ctrl else "speedup"
    dram_key = "ctrl_dram_ratio" if use_ctrl else "dram_ratio"
    shown = (
        [r for r in rows if r["dram_quality"] != "unusable"]
        if hide_unusable
        else rows
    )

    print(f"{'workload':<15}{'speedup':>9}{'dram':>9}{'quality':>10}")
    for r in sorted(shown, key=lambda x: -x[speedup_key]):
        print(
            f"{r['workload']:<15}{r[speedup_key]:>9.3f}"
            f"{r[dram_key]:>9.3f}{r['dram_quality']:>10}"
        )
    print()
    if hide_unusable and omitted:
        print(
            "omitted (unusable DRAM): "
            + ", ".join(r["workload"] for r in omitted)
        )
    print(f"method            : {method}")
    print(f"workloads plotted : {len(shown)}")
    print(f"geomean speedup   : {geomean([r[speedup_key] for r in shown]):.4f}x")
    print(f"geomean DRAM ratio: {geomean([r[dram_key] for r in shown]):.4f}x")
    print(f"baseline reference: {args.baseline_ref}")
    print(f"wrote {csv_path}")
    print(f"wrote {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
