#!/usr/bin/bash

# Baseline-only runner (copied from test.sh).
# Usage: ./test_baseline.sh <kernel> <graph> <smt_core0> [smt_core1]
# smt_core1 is accepted for drop-in compatibility with test.sh but unused.

#----------only set these parameters----------
out_path=output/figure6

repeat=1
tc_repeat=1 # use this to adjust tc repeat times
#----------only set these parameters----------
kernel_name=$1
graph_name=$2
smt_core0=$3

if [ -z "$kernel_name" ] || [ -z "$graph_name" ] || [ -z "$smt_core0" ]; then
    echo "Usage: $0 <kernel> <graph> <smt_core0> [smt_core1]"
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

mkdir -p $out_path

g++ -std=c++11 -pthread -O3 -Wall -w src/$kernel_name.cc -o $kernel_name
out_pf="$out_path/$kernel_name-$graph_name-baseline.txt"
echo "Baseline: $out_pf."
taskset -c $smt_core0 ./$kernel_name -f $graph -n $repeat > $out_pf 2>&1
rm $kernel_name

exit
