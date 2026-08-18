#!/usr/bin/bash

###################################
# need to run with sudo
###################################

# assume sudo modprobe msr
#BitMeaning when = 10L2 Hardware Prefetcher disabled1L2 Adjacent Cache Line Prefetcher disabled2DCU (L1 Data Cache) Prefetcher disabled3DCU IP Prefetcher disabled
# c7i.metal-24xl

smt_core0=0
num_attempts=5
out_root=output_small_graphs

# Create output root; clear prior contents if it already exists
if [ -d "$out_root" ]; then
    echo "clearing $out_root"
    rm -rf "${out_root:?}/"*
else
    mkdir -p "$out_root"
fi

# Dummy array of files
files=(
    "youtube"
    "web_google"
    "web_berkstan"
    "roadnetca"
    "wiki_talk"
    "as_skitter"
    "pokec"
    "livejournal"
    "orkut"
)

# Dummy array of kernels
kernels=(
    "cc"
    "bc"
    "bfs"
    "sssp"
    "pr"
    "tc"
)

echo "msr 0x1a4 before"
sudo rdmsr -p 0 0x1a4
orig=$(sudo rdmsr -p 0 0x1a4)

VAL=0 # desired low nibble
old=$(sudo rdmsr -p 0 0x1a4)
new=$(printf "%x" $(( (0x$old & ~0xf) | 0x$VAL )))
sudo wrmsr -p 0 0x1a4 0x$new
echo "msr 0x1a4 en hwpf"
sudo rdmsr -p 0 0x1a4

for k in "${kernels[@]}"; do
    echo "compile $k"
    g++ -std=c++11 -pthread -O3 -Wall -w src/$k.cc -o $k
    for f in "${files[@]}"; do
        for a in $(seq 1 "$num_attempts"); do
            echo "run $f $k attempt $a"
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/w_hwpf_1rd_${a}" "read";
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/w_hwpf_2rd_${a}" "read";
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/w_hwpf_${a}";
        done
    done
    rm -f $k
done


VAL=7 # desired low nibble
old=$(sudo rdmsr -p 0 0x1a4)
new=$(printf "%x" $(( (0x$old & ~0xf) | 0x$VAL )))
sudo wrmsr -p 0 0x1a4 0x$new
echo "msr 0x1a4 dis hwpf"
sudo rdmsr -p 0 0x1a4

for k in "${kernels[@]}"; do
    echo "compile $k"
    g++ -std=c++11 -pthread -O3 -Wall -w src/$k.cc -o $k
    for f in "${files[@]}"; do
        for a in $(seq 1 "$num_attempts"); do
            echo "run $f $k attempt $a"
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/wo_hwpf_1rd_${a}" "read";
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/wo_hwpf_2rd_${a}" "read";
            ./test_baseline.sh "$k" "$f" "$smt_core0" "${out_root}/wo_hwpf_${a}";
        done
    done
    rm -f $k
done

sudo wrmsr -p 0 0x1a4 0x$orig
echo "msr 0x1a4 after"
sudo rdmsr -p 0 0x1a4

echo "tgz $out_root -> ${out_root}.tgz"
tar -czf "${out_root}.tgz" "$out_root"
echo "Wrote ${out_root}.tgz"

chown ubuntu ${out_root}.tgz
chgrp ubuntu ${out_root}.tgz
