#!/usr/bin/env python3
"""Scatter speedup vs kernel DRAM, matching the gt-spd-vs-dram canvas.

Campaign layout (from spd_vs_dram_traffic.sh / output_gt_spd_traffic.tgz):

  Baseline:  wo_hwpf_*/*-baseline.txt
  hwpf:      w_hwpf_*/*-baseline.txt
  swpf:      wo_hwpf_*/*-swpf.txt
  htpf:      wo_hwpf_*/*-htpf.txt
  swpf-hwpf: w_hwpf_*/*-swpf.txt
  htpf-hwpf: w_hwpf_*/*-htpf.txt

Speedup = wo_hwpf baseline Average Time / method Average Time.
Kernel DRAM (GiB) = full-run IMC CAS (read+write) minus matching *_2rd_
read-in-only run. *_1rd_* is ignored. Attempts with non-positive kernel DRAM
are dropped; remaining attempts are mean-averaged, then ratios recomputed.

Usage:
  python3 plot_gt_spd_vs_dram.py
  python3 plot_gt_spd_vs_dram.py --input output_gt_spd_traffic.tgz
  python3 plot_gt_spd_vs_dram.py --input output_gt_spd_traffic --out scatter.pdf
  python3 plot_gt_spd_vs_dram.py --attempts 1-4 --annotate
"""

from __future__ import annotations

import argparse
import csv
import glob
import math
import os
import re
import sys
import tarfile
import tempfile

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

AVG_TIME_RE = re.compile(r"^Average Time:\s+([0-9.]+)", re.M)
IMC_RE = re.compile(
    r"^\s*([0-9.]+)\s+MiB\s+uncore_imc_\d+/cas_count_(read|write)/",
    re.M,
)
EXIT_RE = re.compile(r"Exiting after graph read-in")

# Matches the gt-spd-vs-dram canvas: (id, side dir prefix, file suffix).
CONFIGS = [
    ("hwpf", "w_hwpf", "baseline"),
    ("swpf", "wo_hwpf", "swpf"),
    ("htpf", "wo_hwpf", "htpf"),
    ("swpf-hwpf", "w_hwpf", "swpf"),
    ("htpf-hwpf", "w_hwpf", "htpf"),
]

CONFIG_STYLE = {
    "hwpf": {"color": "#1f77b4", "marker": "o", "label": "hwpf"},
    "swpf": {"color": "#ff7f0e", "marker": "s", "label": "swpf"},
    "htpf": {"color": "#2ca02c", "marker": "^", "label": "htpf"},
    "swpf-hwpf": {"color": "#d62728", "marker": "D", "label": "swpf-hwpf"},
    "htpf-hwpf": {"color": "#9467bd", "marker": "P", "label": "htpf-hwpf"},
}


def geomean(values: list[float]) -> float:
    usable = [v for v in values if v is not None and math.isfinite(v) and v > 0]
    if not usable:
        return float("nan")
    return math.exp(sum(math.log(v) for v in usable) / len(usable))


def parse_log(path: str) -> dict | None:
    if not os.path.isfile(path):
        return None
    with open(path) as f:
        text = f.read()
    if "failed to parse CPU list" in text:
        return None
    read_mib = 0.0
    write_mib = 0.0
    for value, kind in IMC_RE.findall(text):
        if kind == "read":
            read_mib += float(value)
        else:
            write_mib += float(value)
    if read_mib == 0.0 and write_mib == 0.0:
        return None
    m = AVG_TIME_RE.search(text)
    return {
        "avg_time_s": float(m.group(1)) if m else None,
        "dram_gib": (read_mib + write_mib) / 1024.0,
        "exit_after_read": bool(EXIT_RE.search(text)),
    }


def find_campaign_root(path: str) -> str:
    """Return the directory that contains w_hwpf_1 / wo_hwpf_1."""
    if os.path.isdir(os.path.join(path, "w_hwpf_1")):
        return path
    nested = os.path.join(path, "output_gt_spd_traffic")
    if os.path.isdir(os.path.join(nested, "w_hwpf_1")):
        return nested
    children = [
        os.path.join(path, name)
        for name in os.listdir(path)
        if os.path.isdir(os.path.join(path, name))
    ]
    if len(children) == 1 and os.path.isdir(os.path.join(children[0], "w_hwpf_1")):
        return children[0]
    raise SystemExit(
        f"Could not find w_hwpf_1 under {path}. "
        "Pass --input to the tarball or the extracted campaign directory."
    )


def open_campaign(input_path: str) -> tuple[str, tempfile.TemporaryDirectory | None]:
    if os.path.isdir(input_path):
        return find_campaign_root(input_path), None
    if not os.path.isfile(input_path):
        raise SystemExit(f"No such file or directory: {input_path}")
    tmp = tempfile.TemporaryDirectory(prefix="gt_spd_vs_dram_")
    with tarfile.open(input_path, "r:*") as tar:
        tar.extractall(tmp.name)
    return find_campaign_root(tmp.name), tmp


def parse_attempts(spec: str) -> list[int]:
    if "-" in spec:
        lo, hi = spec.split("-", 1)
        return list(range(int(lo), int(hi) + 1))
    return [int(x) for x in spec.split(",") if x.strip()]


def aggregate(root: str, attempts: list[int]) -> list[dict]:
    base_files = sorted(
        os.path.basename(p)
        for p in glob.glob(os.path.join(root, "wo_hwpf_1", "*-baseline.txt"))
    )
    workloads = [name.replace("-baseline.txt", "") for name in base_files]
    rows: list[dict] = []

    for name in workloads:
        kernel = name.split("-", 1)[0]
        for cfg, side, suffix in CONFIGS:
            fname = f"{name}-{suffix}.txt"
            times_wo: list[float] = []
            times_m: list[float] = []
            kd_wo: list[float] = []
            kd_m: list[float] = []
            sps: list[float] = []
            drs: list[float] = []
            n_ok = 0
            for attempt in attempts:
                wo = parse_log(
                    os.path.join(root, f"wo_hwpf_{attempt}", f"{name}-baseline.txt")
                )
                wo2 = parse_log(
                    os.path.join(
                        root, f"wo_hwpf_2rd_{attempt}", f"{name}-baseline.txt"
                    )
                )
                method = parse_log(os.path.join(root, f"{side}_{attempt}", fname))
                method2 = parse_log(
                    os.path.join(root, f"{side}_2rd_{attempt}", fname)
                )
                if None in (wo, wo2, method, method2):
                    continue
                if wo["avg_time_s"] is None or method["avg_time_s"] is None:
                    continue
                if not wo2["exit_after_read"] or not method2["exit_after_read"]:
                    continue
                k_wo = wo["dram_gib"] - wo2["dram_gib"]
                k_m = method["dram_gib"] - method2["dram_gib"]
                if k_wo <= 0 or k_m <= 0:
                    continue
                n_ok += 1
                times_wo.append(wo["avg_time_s"])
                times_m.append(method["avg_time_s"])
                kd_wo.append(k_wo)
                kd_m.append(k_m)
                sps.append(wo["avg_time_s"] / method["avg_time_s"])
                drs.append(k_m / k_wo)
            if n_ok == 0:
                continue
            base_time = sum(times_wo) / n_ok
            meth_time = sum(times_m) / n_ok
            base_dram = sum(kd_wo) / n_ok
            meth_dram = sum(kd_m) / n_ok
            rows.append(
                {
                    "workload": name,
                    "kernel": kernel,
                    "config": cfg,
                    "n_ok": n_ok,
                    "n_attempts": len(attempts),
                    "base_time_s": base_time,
                    "meth_time_s": meth_time,
                    "speedup": base_time / meth_time,
                    "base_dram_gib": base_dram,
                    "meth_dram_gib": meth_dram,
                    "dram_ratio": meth_dram / base_dram,
                    "speedup_min": min(sps),
                    "speedup_max": max(sps),
                    "dram_min": min(drs),
                    "dram_max": max(drs),
                }
            )
    return rows


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
    annotate: bool,
    configs: list[str],
) -> None:
    fig, ax = plt.subplots(figsize=(8.8, 6.8))

    for cfg in configs:
        group = [r for r in rows if r["config"] == cfg]
        if not group:
            continue
        style = CONFIG_STYLE[cfg]
        ax.scatter(
            [r["dram_ratio"] for r in group],
            [r["speedup"] for r in group],
            s=54,
            color=style["color"],
            marker=style["marker"],
            zorder=2,
            edgecolors="none",
            alpha=0.55,
        )
        gx = geomean([r["dram_ratio"] for r in group])
        gy = geomean([r["speedup"] for r in group])
        if math.isfinite(gx) and math.isfinite(gy):
            ax.scatter(
                [gx],
                [gy],
                s=260,
                color=style["color"],
                marker="*",
                zorder=5,
                edgecolors="black",
                linewidths=0.8,
                alpha=1.0,
            )

    pickle_dram = 1.02
    pickle_speedup = 1.46
    ax.scatter(
        [pickle_dram],
        [pickle_speedup],
        s=260,
        color="#111111",
        marker="*",
        zorder=6,
        edgecolors="black",
        linewidths=0.8,
        alpha=1.0,
    )
    ax.annotate(
        "Pickle",
        (pickle_dram, pickle_speedup),
        textcoords="offset points",
        xytext=(0, 16),
        fontsize=20,
        fontweight="bold",
        color="#111111",
        zorder=6,
    )

    if annotate:
        for r in rows:
            ax.annotate(
                r["workload"],
                (r["dram_ratio"], r["speedup"]),
                textcoords="offset points",
                xytext=(4, 3),
                fontsize=6.5,
                alpha=0.8,
            )

    ax.axhline(1.0, color="0.45", linestyle="--", linewidth=1.0, zorder=1)
    ax.axvline(1.0, color="0.45", linestyle="--", linewidth=1.0, zorder=1)

    xs = [r["dram_ratio"] for r in rows] + [pickle_dram]
    ys = [r["speedup"] for r in rows] + [pickle_speedup]
    ax.set_xlim(min(0.85, min(xs) - 0.04), max(1.9, max(xs) + 0.04))
    ax.set_ylim(min(0.65, min(ys) - 0.05), max(2.95, max(ys) + 0.05))

    ax.set_xlabel("Kernel DRAM vs wo_hwpf baseline (x)")
    ax.set_ylabel("Speedup vs wo_hwpf baseline (x)")
    ax.set_title("GAP graphs — speedup vs kernel DRAM (runs 1–4)")
    ax.grid(True, linestyle=":", linewidth=0.6, alpha=0.7)

    handles = [
        Line2D(
            [0],
            [0],
            marker=CONFIG_STYLE[cfg]["marker"],
            color=CONFIG_STYLE[cfg]["color"],
            linestyle="None",
            markersize=8,
        )
        for cfg in configs
        if any(r["config"] == cfg for r in rows)
    ]
    labels = [
        CONFIG_STYLE[cfg]["label"]
        for cfg in configs
        if any(r["config"] == cfg for r in rows)
    ]
    handles.append(
        Line2D(
            [0],
            [0],
            marker="*",
            color="0.2",
            markerfacecolor="none",
            markeredgecolor="0.2",
            markeredgewidth=1.2,
            linestyle="None",
            markersize=13,
        )
    )
    labels.append("geomean")
    handles.append(
        Line2D(
            [0],
            [0],
            marker="*",
            color="#111111",
            markerfacecolor="#111111",
            linestyle="None",
            markersize=13,
        )
    )
    labels.append("Pickle")
    ax.legend(handles, labels, loc="best", framealpha=0.92)

    fig.tight_layout()
    fig.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def print_summary(rows: list[dict], configs: list[str]) -> None:
    print(f"{'config':<12}{'n':>4}{'geoS':>8}{'geoD':>8}{'wins':>8}")
    for cfg in configs:
        group = [r for r in rows if r["config"] == cfg]
        if not group:
            continue
        wins = sum(1 for r in group if r["speedup"] > 1)
        print(
            f"{cfg:<12}{len(group):>4}"
            f"{geomean([r['speedup'] for r in group]):>8.3f}"
            f"{geomean([r['dram_ratio'] for r in group]):>8.3f}"
            f"{wins:>4}/{len(group)}"
        )


def default_input() -> str:
    tgz = os.path.join(SCRIPT_DIR, "output_gt_spd_traffic.tgz")
    directory = os.path.join(SCRIPT_DIR, "output_gt_spd_traffic")
    if os.path.isfile(tgz):
        return tgz
    if os.path.isdir(directory):
        return directory
    return tgz


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--input",
        default=default_input(),
        help="Path to output_gt_spd_traffic.tgz or an extracted directory "
        "(default: gap/output_gt_spd_traffic.tgz if present).",
    )
    parser.add_argument(
        "--attempts",
        default="1-4",
        help="Attempt range or list, e.g. 1-4 or 1,2,3,4 (default: 1-4).",
    )
    parser.add_argument(
        "--config",
        nargs="*",
        choices=[c[0] for c in CONFIGS],
        default=[c[0] for c in CONFIGS],
        help="Configs to include (default: all five).",
    )
    parser.add_argument(
        "--annotate",
        action="store_true",
        help="Label every point with its workload name.",
    )
    parser.add_argument(
        "--out",
        default=os.path.join(SCRIPT_DIR, "gt_spd_vs_dram.png"),
        help="Output image (.png / .pdf / .svg).",
    )
    parser.add_argument(
        "--csv",
        default=os.path.join(SCRIPT_DIR, "gt_spd_vs_dram.csv"),
        help="CSV path for the aggregated table.",
    )
    args = parser.parse_args()
    attempts = parse_attempts(args.attempts)
    configs = args.config

    root, tmp = open_campaign(args.input)
    try:
        rows = aggregate(root, attempts)
    finally:
        if tmp is not None:
            tmp.cleanup()

    rows = [r for r in rows if r["config"] in configs]
    if not rows:
        print("No valid (workload, config) pairs after filtering.", file=sys.stderr)
        return 1

    write_csv(rows, args.csv)
    plot_scatter(rows, args.out, annotate=args.annotate, configs=configs)
    print_summary(rows, configs)
    print(f"wrote {args.out}")
    print(f"wrote {args.csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
