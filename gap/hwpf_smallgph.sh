#!/usr/bin/bash

# assume sudo modprobe msr
#BitMeaning when = 10L2 Hardware Prefetcher disabled1L2 Adjacent Cache Line Prefetcher disabled2DCU (L1 Data Cache) Prefetcher disabled3DCU IP Prefetcher disabled
# c7i.metal-24xl

smt_core0=0



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

for f in "${files[@]}"; do
    for k in "${kernels[@]}"; do
        echo "run $f $k"
        ./test_baseline.sh "$k" "$f" "$smt_core0" w_hwpf;
    done
done


VAL=7 # desired low nibble
old=$(sudo rdmsr -p 0 0x1a4)
new=$(printf "%x" $(( (0x$old & ~0xf) | 0x$VAL )))
sudo wrmsr -p 0 0x1a4 0x$new
echo "msr 0x1a4 dis hwpf"
sudo rdmsr -p 0 0x1a4

for f in "${files[@]}"; do
    for k in "${kernels[@]}"; do
        echo "run $f $k"
        ./test_baseline.sh "$k" "$f" "$smt_core0" wo_hwpf;
    done
done

sudo wrmsr -p 0 0x1a4 0x$orig
echo "msr 0x1a4 after"
sudo rdmsr -p 0 0x1a4
