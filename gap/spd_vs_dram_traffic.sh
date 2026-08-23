#!/usr/bin/bash

# run on c7i.metal-24xl which support serialize instruction, check with "lscpu | grep serialize"

smt_core0=$1
smt_core1=$2
num_attempts=4
out_root=output_gt_spd_traffic

files=(
    "kron"
    "twitter"
    "urand"
    "road"
    "web"
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

for a in $(seq 1 "$num_attempts"); do
    for k in "${kernels[@]}"; do
        echo "compile $k"
        for f in "${files[@]}"; do
            g="$f"
            if [ "$k" == "tc" ] && { [ "$f" == "twitter" ] || [ "$f" == "road" ] || [ "$f" == "web" ]; }; then
                g="${f}U"
            fi
            echo "run $g $k attempt $a"
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/w_hwpf_1rd_${a}" "read";
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/w_hwpf_2rd_${a}" "read";
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/w_hwpf_${a}";
        done
    done
done


VAL=7 # desired low nibble
old=$(sudo rdmsr -p 0 0x1a4)
new=$(printf "%x" $(( (0x$old & ~0xf) | 0x$VAL )))
sudo wrmsr -p 0 0x1a4 0x$new
echo "msr 0x1a4 dis hwpf"
sudo rdmsr -p 0 0x1a4

for a in $(seq 1 "$num_attempts"); do
    for k in "${kernels[@]}"; do
        echo "compile $k"
        for f in "${files[@]}"; do
            g="$f"
            if [ "$k" == "tc" ] && { [ "$f" == "twitter" ] || [ "$f" == "road" ] || [ "$f" == "web" ]; }; then
                g="${f}U"
            fi
            echo "run $g $k attempt $a"
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/wo_hwpf_1rd_${a}" "read";
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/wo_hwpf_2rd_${a}" "read";
            ./test_gt.sh "$k" "$g" "$smt_core0" "$smt_core1" "${out_root}/wo_hwpf_${a}";
        done
    done
done

sudo wrmsr -p 0 0x1a4 0x$orig
echo "msr 0x1a4 after"
sudo rdmsr -p 0 0x1a4

echo "tgz $out_root -> ${out_root}.tgz"
tar -czf "${out_root}.tgz" "$out_root"
echo "Wrote ${out_root}.tgz"

chown ubuntu ${out_root}.tgz
chgrp ubuntu ${out_root}.tgz

