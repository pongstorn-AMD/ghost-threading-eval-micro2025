# Makefile-based Benchmarking Infrastructure
# Scott Beamer, 2017



# Generate Input Graphs ------------------------------------------------#
#-----------------------------------------------------------------------#

GRAPH_DIR = benchmark/graphs
RAW_GRAPH_DIR = benchmark/graphs/raw

GRAPHS = twitter twitter-train web web-train road road-train kron kron-train urand urand-train \
	youtube web_google web_berkstan roadnetca wiki_talk as_skitter pokec livejournal orkut
ALL_GRAPHS =\
	$(addsuffix .sg, $(GRAPHS)) \
	$(addsuffix .wsg, $(GRAPHS)) \
	$(addsuffix U.sg, $(GRAPHS))
ALL_GRAPHS_WITH_PATHS = $(addprefix $(GRAPH_DIR)/, $(ALL_GRAPHS))

$(RAW_GRAPH_DIR):
	mkdir -p $@

.PHONY: bench-graphs
bench-graphs: $(RAW_GRAPH_DIR) $(ALL_GRAPHS_WITH_PATHS)


# Real-world

TWITTER_URL = https://github.com/ANLAB-KAIST/traces/releases/download/twitter_rv.net/twitter_rv.net.$*.gz
$(RAW_GRAPH_DIR)/twitter_rv.net.%.gz:
	wget -P $(RAW_GRAPH_DIR) $(TWITTER_URL)

$(RAW_GRAPH_DIR)/twitter_rv.net: $(RAW_GRAPH_DIR)/twitter_rv.net.00.gz $(RAW_GRAPH_DIR)/twitter_rv.net.01.gz $(RAW_GRAPH_DIR)/twitter_rv.net.02.gz $(RAW_GRAPH_DIR)/twitter_rv.net.03.gz
	gunzip -c $^ > $@
	touch $@

$(RAW_GRAPH_DIR)/twitter.el: $(RAW_GRAPH_DIR)/twitter_rv.net
	rm -f $@
	ln -s twitter_rv.net $@

$(GRAPH_DIR)/twitter.sg: $(RAW_GRAPH_DIR)/twitter.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/twitter.wsg: $(RAW_GRAPH_DIR)/twitter.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/twitterU.sg: $(RAW_GRAPH_DIR)/twitter.el converter
	./converter -sf $< -b $@

# twitter-train
TWITTER_SIM_ARGS = -g26 -k24
$(GRAPH_DIR)/twitter-train.sg: converter
	./converter $(TWITTER_SIM_ARGS) -b $@

$(GRAPH_DIR)/twitter-train.wsg: converter
	./converter $(TWITTER_SIM_ARGS) -wb $@

$(GRAPH_DIR)/twitter-trainU.sg: $(GRAPH_DIR)/twitter-train.sg converter
	rm -f $@
	ln -s twitter-train.sg $@

ROAD_URL = http://www.dis.uniroma1.it/challenge9/data/USA-road-d/USA-road-d.USA.gr.gz
$(RAW_GRAPH_DIR)/USA-road-d.USA.gr.gz:
	wget -P $(RAW_GRAPH_DIR) $(ROAD_URL)

$(RAW_GRAPH_DIR)/USA-road-d.USA.gr: $(RAW_GRAPH_DIR)/USA-road-d.USA.gr.gz
	cd $(RAW_GRAPH_DIR)
	gunzip < $< > $@

$(GRAPH_DIR)/road.sg: $(RAW_GRAPH_DIR)/USA-road-d.USA.gr converter
	./converter -f $< -b $@

$(GRAPH_DIR)/road.wsg: $(RAW_GRAPH_DIR)/USA-road-d.USA.gr converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/roadU.sg: $(RAW_GRAPH_DIR)/USA-road-d.USA.gr converter
	./converter -sf $< -b $@

# road-central
ROAD_SIM_URL = http://www.diag.uniroma1.it/challenge9/data/USA-road-d/USA-road-d.CTR.gr.gz
$(RAW_GRAPH_DIR)/USA-road-d.CTR.gr.gz:
	wget -P $(RAW_GRAPH_DIR) $(ROAD_SIM_URL)

$(RAW_GRAPH_DIR)/USA-road-d.CTR.gr: $(RAW_GRAPH_DIR)/USA-road-d.CTR.gr.gz
	cd $(RAW_GRAPH_DIR)
	gunzip < $< > $@

$(GRAPH_DIR)/road-train.sg: $(RAW_GRAPH_DIR)/USA-road-d.CTR.gr converter
	./converter -f $< -b $@

$(GRAPH_DIR)/road-train.wsg: $(RAW_GRAPH_DIR)/USA-road-d.CTR.gr converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/road-trainU.sg: $(RAW_GRAPH_DIR)/USA-road-d.CTR.gr converter
	./converter -sf $< -b $@

WEB_URL = https://sparse.tamu.edu/MM/LAW/sk-2005.tar.gz
$(RAW_GRAPH_DIR)/sk-2005.tar.gz:
	wget -P $(RAW_GRAPH_DIR) $(WEB_URL)

$(RAW_GRAPH_DIR)/sk-2005/sk-2005.mtx: $(RAW_GRAPH_DIR)/sk-2005.tar.gz
	tar -zxvf $< -C $(RAW_GRAPH_DIR)
	touch $@

$(GRAPH_DIR)/web.sg: $(RAW_GRAPH_DIR)/sk-2005/sk-2005.mtx converter
	./converter -f $< -b $@

$(GRAPH_DIR)/web.wsg: $(RAW_GRAPH_DIR)/sk-2005/sk-2005.mtx converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/webU.sg: $(RAW_GRAPH_DIR)/sk-2005/sk-2005.mtx converter
	./converter -sf $< -b $@

# WEB it-2004
WEB_URL_it = https://sparse.tamu.edu/MM/LAW/it-2004.tar.gz
$(RAW_GRAPH_DIR)/it-2004.tar.gz:
	wget -P $(RAW_GRAPH_DIR) $(WEB_URL_it)

$(RAW_GRAPH_DIR)/it-2004/it-2004.mtx: $(RAW_GRAPH_DIR)/it-2004.tar.gz
	tar -zxvf $< -C $(RAW_GRAPH_DIR)
	touch $@

$(GRAPH_DIR)/web-train.sg: $(RAW_GRAPH_DIR)/it-2004/it-2004.mtx converter
	./converter -f $< -b $@

$(GRAPH_DIR)/web-train.wsg: $(RAW_GRAPH_DIR)/it-2004/it-2004.mtx converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/web-trainU.sg: $(RAW_GRAPH_DIR)/it-2004/it-2004.mtx converter
	./converter -sf $< -b $@


# Synthetic

KRON_ARGS = -g27 -k16
$(GRAPH_DIR)/kron.sg: converter
	./converter $(KRON_ARGS) -b $@

$(GRAPH_DIR)/kron.wsg: converter
	./converter $(KRON_ARGS) -wb $@

$(GRAPH_DIR)/kronU.sg: $(GRAPH_DIR)/kron.sg converter
	rm -f $@
	ln -s kron.sg $@

# kron-train
KRON_SIM_ARGS = -g26 -k15
$(GRAPH_DIR)/kron-train.sg: converter
	./converter $(KRON_SIM_ARGS) -b $@

$(GRAPH_DIR)/kron-train.wsg: converter
	./converter $(KRON_SIM_ARGS) -wb $@

$(GRAPH_DIR)/kron-trainU.sg: $(GRAPH_DIR)/kron-train.sg converter
	rm -f $@
	ln -s kron-train.sg $@

URAND_ARGS = -u27 -k16
$(GRAPH_DIR)/urand.sg: converter
	./converter $(URAND_ARGS) -b $@

$(GRAPH_DIR)/urand.wsg: converter
	./converter $(URAND_ARGS) -wb $@

$(GRAPH_DIR)/urandU.sg: $(GRAPH_DIR)/urand.sg converter
	rm -f $@
	ln -s urand.sg $@

# urand-train
URAND_SIM_ARGS = -u26 -k15
$(GRAPH_DIR)/urand-train.sg: converter
	./converter $(URAND_SIM_ARGS) -b $@

$(GRAPH_DIR)/urand-train.wsg: converter
	./converter $(URAND_SIM_ARGS) -wb $@

$(GRAPH_DIR)/urand-trainU.sg: $(GRAPH_DIR)/urand-train.sg converter
	rm -f $@
	ln -s urand-train.sg $@


# SNAP graphs (download + convert to GAP serialized format)
# Source: https://snap.stanford.edu/data/
# Comment lines (# ...) are stripped when producing .el for the converter.

# youtube (com-Youtube undirected)
YOUTUBE_URL = https://snap.stanford.edu/data/bigdata/communities/com-youtube.ungraph.txt.gz
$(RAW_GRAPH_DIR)/com-youtube.ungraph.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(YOUTUBE_URL)

$(RAW_GRAPH_DIR)/youtube.el: $(RAW_GRAPH_DIR)/com-youtube.ungraph.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/youtube.sg: $(RAW_GRAPH_DIR)/youtube.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/youtube.wsg: $(RAW_GRAPH_DIR)/youtube.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/youtubeU.sg: $(RAW_GRAPH_DIR)/youtube.el converter
	./converter -sf $< -b $@

# web_google
WEB_GOOGLE_URL = https://snap.stanford.edu/data/web-Google.txt.gz
$(RAW_GRAPH_DIR)/web-Google.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(WEB_GOOGLE_URL)

$(RAW_GRAPH_DIR)/web_google.el: $(RAW_GRAPH_DIR)/web-Google.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/web_google.sg: $(RAW_GRAPH_DIR)/web_google.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/web_google.wsg: $(RAW_GRAPH_DIR)/web_google.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/web_googleU.sg: $(RAW_GRAPH_DIR)/web_google.el converter
	./converter -sf $< -b $@

# web_berkstan
WEB_BERKSTAN_URL = https://snap.stanford.edu/data/web-BerkStan.txt.gz
$(RAW_GRAPH_DIR)/web-BerkStan.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(WEB_BERKSTAN_URL)

$(RAW_GRAPH_DIR)/web_berkstan.el: $(RAW_GRAPH_DIR)/web-BerkStan.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/web_berkstan.sg: $(RAW_GRAPH_DIR)/web_berkstan.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/web_berkstan.wsg: $(RAW_GRAPH_DIR)/web_berkstan.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/web_berkstanU.sg: $(RAW_GRAPH_DIR)/web_berkstan.el converter
	./converter -sf $< -b $@

# roadnetca (California road network)
ROADNETCA_URL = https://snap.stanford.edu/data/roadNet-CA.txt.gz
$(RAW_GRAPH_DIR)/roadNet-CA.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(ROADNETCA_URL)

$(RAW_GRAPH_DIR)/roadnetca.el: $(RAW_GRAPH_DIR)/roadNet-CA.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/roadnetca.sg: $(RAW_GRAPH_DIR)/roadnetca.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/roadnetca.wsg: $(RAW_GRAPH_DIR)/roadnetca.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/roadnetcaU.sg: $(RAW_GRAPH_DIR)/roadnetca.el converter
	./converter -sf $< -b $@

# wiki_talk
WIKI_TALK_URL = https://snap.stanford.edu/data/wiki-Talk.txt.gz
$(RAW_GRAPH_DIR)/wiki-Talk.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(WIKI_TALK_URL)

$(RAW_GRAPH_DIR)/wiki_talk.el: $(RAW_GRAPH_DIR)/wiki-Talk.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/wiki_talk.sg: $(RAW_GRAPH_DIR)/wiki_talk.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/wiki_talk.wsg: $(RAW_GRAPH_DIR)/wiki_talk.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/wiki_talkU.sg: $(RAW_GRAPH_DIR)/wiki_talk.el converter
	./converter -sf $< -b $@

# as_skitter
AS_SKITTER_URL = https://snap.stanford.edu/data/as-skitter.txt.gz
$(RAW_GRAPH_DIR)/as-skitter.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(AS_SKITTER_URL)

$(RAW_GRAPH_DIR)/as_skitter.el: $(RAW_GRAPH_DIR)/as-skitter.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/as_skitter.sg: $(RAW_GRAPH_DIR)/as_skitter.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/as_skitter.wsg: $(RAW_GRAPH_DIR)/as_skitter.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/as_skitterU.sg: $(RAW_GRAPH_DIR)/as_skitter.el converter
	./converter -sf $< -b $@

# pokec
POKEC_URL = https://snap.stanford.edu/data/soc-pokec-relationships.txt.gz
$(RAW_GRAPH_DIR)/soc-pokec-relationships.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(POKEC_URL)

$(RAW_GRAPH_DIR)/pokec.el: $(RAW_GRAPH_DIR)/soc-pokec-relationships.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/pokec.sg: $(RAW_GRAPH_DIR)/pokec.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/pokec.wsg: $(RAW_GRAPH_DIR)/pokec.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/pokecU.sg: $(RAW_GRAPH_DIR)/pokec.el converter
	./converter -sf $< -b $@

# livejournal
LIVEJOURNAL_URL = https://snap.stanford.edu/data/soc-LiveJournal1.txt.gz
$(RAW_GRAPH_DIR)/soc-LiveJournal1.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(LIVEJOURNAL_URL)

$(RAW_GRAPH_DIR)/livejournal.el: $(RAW_GRAPH_DIR)/soc-LiveJournal1.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/livejournal.sg: $(RAW_GRAPH_DIR)/livejournal.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/livejournal.wsg: $(RAW_GRAPH_DIR)/livejournal.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/livejournalU.sg: $(RAW_GRAPH_DIR)/livejournal.el converter
	./converter -sf $< -b $@

# orkut
ORKUT_URL = https://snap.stanford.edu/data/bigdata/communities/com-orkut.ungraph.txt.gz
$(RAW_GRAPH_DIR)/com-orkut.ungraph.txt.gz:
	wget -P $(RAW_GRAPH_DIR) $(ORKUT_URL)

$(RAW_GRAPH_DIR)/orkut.el: $(RAW_GRAPH_DIR)/com-orkut.ungraph.txt.gz
	gunzip -c $< | grep -v '^#' > $@

$(GRAPH_DIR)/orkut.sg: $(RAW_GRAPH_DIR)/orkut.el converter
	./converter -f $< -b $@

$(GRAPH_DIR)/orkut.wsg: $(RAW_GRAPH_DIR)/orkut.el converter
	./converter -f $< -wb $@

$(GRAPH_DIR)/orkutU.sg: $(RAW_GRAPH_DIR)/orkut.el converter
	./converter -sf $< -b $@


# Benchmark Execution --------------------------------------------------#
#-----------------------------------------------------------------------#

OUTPUT_DIR = benchmark/out

$(OUTPUT_DIR):
	mkdir -p $@

# Ordered to reuse input graphs to increase OS file cache hit probability
BENCH_ORDER = \
	bfs-twitter pr-twitter cc-twitter bc-twitter \
	bfs-web pr-web cc-web bc-web \
	bfs-road pr-road cc-road bc-road \
	bfs-kron pr-kron cc-kron bc-kron tc-kron \
	bfs-urand pr-urand cc-urand bc-urand tc-urand \
	sssp-twitter sssp-web sssp-road sssp-kron sssp-urand \
	tc-twitter tc-web tc-road

OUTPUT_FILES = $(addsuffix .out, $(addprefix $(OUTPUT_DIR)/, $(BENCH_ORDER)))

.PHONY: bench-run
bench-run: $(OUTPUT_DIR) $(OUTPUT_FILES)

$(OUTPUT_DIR)/bfs-%.out : $(GRAPH_DIR)/%.sg bfs
	./bfs -f $< -n64 > $@

SSSP_ARGS = -n64
$(OUTPUT_DIR)/sssp-twitter.out: $(GRAPH_DIR)/twitter.wsg sssp
	./sssp -f $< $(SSSP_ARGS) -d2 > $@

$(OUTPUT_DIR)/sssp-web.out: $(GRAPH_DIR)/web.wsg sssp
	./sssp -f $< $(SSSP_ARGS) -d2 > $@

$(OUTPUT_DIR)/sssp-road.out: $(GRAPH_DIR)/road.wsg sssp
	./sssp -f $< $(SSSP_ARGS) -d50000 > $@

$(OUTPUT_DIR)/sssp-kron.out: $(GRAPH_DIR)/kron.wsg sssp
	./sssp -f $< $(SSSP_ARGS) -d2 > $@

$(OUTPUT_DIR)/sssp-urand.out: $(GRAPH_DIR)/urand.wsg sssp
	./sssp -f $< $(SSSP_ARGS) -d2 > $@

$(OUTPUT_DIR)/pr-%.out: $(GRAPH_DIR)/%.sg pr
	./pr -f $< -i1000 -t1e-4 -n16 > $@

$(OUTPUT_DIR)/cc-%.out: $(GRAPH_DIR)/%.sg cc
	./cc -f $< -n16 > $@

$(OUTPUT_DIR)/bc-%.out: $(GRAPH_DIR)/%.sg bc
	./bc -f $< -i4 -n16 > $@

$(OUTPUT_DIR)/tc-%.out: $(GRAPH_DIR)/%U.sg tc
	./tc -f $< -n3 > $@
