#!/usr/bin/bash

# Baseline-only runner (expects ./$kernel already built by the caller).
# Usage: ./test_baseline.sh <kernel> <graph> <smt_core0> <out_dir> [read]

#----------only set these parameters----------

repeat=1
tc_repeat=1 # use this to adjust tc repeat times
#----------only set these parameters----------
kernel_name=$1
graph_name=$2
smt_core0=$3
dir_name=$4
out_path="$dir_name"
read_only="NONE"
read_only=$5

if [ -z "$kernel_name" ] || [ -z "$graph_name" ] || [ -z "$smt_core0" ]; then
    echo "Usage: $0 <kernel> <graph> <smt_core0> <out_dir> [read]"
    exit 1
fi

if [ "$kernel_name" == "sssp" ]; then
    graph_postfix=wsg
else
    graph_postfix=sg
fi

if [ "$kernel_name" == "tc" ]; then
    repeat=$tc_repeat
fi

graph=benchmark/graphs/$graph_name.$graph_postfix
if [ ! -f "$graph" ]; then
    echo "Missing graph file: $graph"
    exit 1
fi

if [ ! -x "./$kernel_name" ]; then
    echo "Missing binary: ./$kernel_name (compile it before calling this script)"
    exit 1
fi

mkdir -p $out_path

out_pf="$out_path/$kernel_name-$graph_name-baseline.txt"
echo "Baseline: $out_pf."
if [ "$read_only" == "read" ]; then
perf stat -a -euncore_imc_*/cas_count_read/,uncore_imc_*/cas_count_write/ taskset -c $smt_core0 ./$kernel_name -f $graph -n $repeat -x > $out_pf 2>&1
else
perf stat -a -euncore_imc_*/cas_count_read/,uncore_imc_*/cas_count_write/ taskset -c $smt_core0 ./$kernel_name -f $graph -n $repeat > $out_pf 2>&1
fi

exit
