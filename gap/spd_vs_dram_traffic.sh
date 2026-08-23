#!/usr/bin/bash

# run sudo ./spd_vs_dram_traffic.sh 0 48
# on c7i.metal-24xl which support serialize instruction, check with "lscpu | grep serialize"
#ubuntu@ip-172-31-8-79:~/ghost-threading-eval-micro2025/gap/output_gt_spd_traffic$ lscpu
#Architecture:                x86_64
#  CPU op-mode(s):            32-bit, 64-bit
#  Address sizes:             46 bits physical, 57 bits virtual
#  Byte Order:                Little Endian
#CPU(s):                      96
#  On-line CPU(s) list:       0-95
#Vendor ID:                   GenuineIntel
#  Model name:                Intel(R) Xeon(R) Platinum 8488C
#    CPU family:              6
#    Model:                   143
#    Thread(s) per core:      2
#    Core(s) per socket:      48
#    Socket(s):               1
#    Stepping:                8
#    CPU(s) scaling MHz:      26%
#    CPU max MHz:             3800.0000
#    CPU min MHz:             800.0000
#    BogoMIPS:                4800.00
#    Flags:                   fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts r
#                             ep_good nopl xtopology nonstop_tsc cpuid aperfmperf tsc_known_freq pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr pdcm pcid dca sse4_1 sse4_2 x2apic movbe popc
#                             nt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb cat_l3 cat_l2 cdp_l3 intel_ppin cdp_l2 ssbd mba ibrs ibpb stibp ibrs_enhanced tpr_shadow flexpriori
#                             ty ept vpid ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid cqm rdt_a avx512f avx512dq rdseed adx smap avx512ifma clflushopt clwb intel_pt avx512cd sha_ni avx512bw avx512vl xsav
#                             eopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_mbm_local split_lock_detect user_shstk avx_vnni avx512_bf16 wbnoinvd dtherm ida arat pln pts hwp hwp_act_window hwp_epp hw
#                             p_pkg_req hfi vnmi avx512vbmi umip pku ospke waitpkg avx512_vbmi2 gfni vaes vpclmulqdq avx512_vnni avx512_bitalg tme avx512_vpopcntdq la57 rdpid bus_lock_detect cldemote movdiri movdir64b e
#                             nqcmd fsrm md_clear serialize tsxldtrk pconfig arch_lbr ibt amx_bf16 avx512_fp16 amx_tile amx_int8 flush_l1d arch_capabilities
#Virtualization features:     
#  Virtualization:            VT-x
#Caches (sum of all):         
#  L1d:                       2.3 MiB (48 instances)
#  L1i:                       1.5 MiB (48 instances)
#  L2:                        96 MiB (48 instances)
#  L3:                        105 MiB (1 instance)
#NUMA:                        
#  NUMA node(s):              1
#  NUMA node0 CPU(s):         0-95

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

