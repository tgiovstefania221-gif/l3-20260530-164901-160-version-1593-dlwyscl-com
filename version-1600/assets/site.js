(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    var heroTimer = null;

    function showHeroSlide(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === heroIndex);
        });

        dots.forEach(function (dot, position) {
            dot.classList.toggle("active", position === heroIndex);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                showHeroSlide(position);
                if (heroTimer) {
                    window.clearInterval(heroTimer);
                }
                heroTimer = window.setInterval(function () {
                    showHeroSlide(heroIndex + 1);
                }, 5200);
            });
        });

        heroTimer = window.setInterval(function () {
            showHeroSlide(heroIndex + 1);
        }, 5200);
    }

    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    filterBlocks.forEach(function (block) {
        var input = block.querySelector(".filter-input");
        var selects = Array.prototype.slice.call(block.querySelectorAll(".filter-select"));
        var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card"));
        var empty = block.querySelector(".empty-state");

        function valueOf(card, name) {
            return (card.getAttribute("data-" + name) || "").toLowerCase();
        }

        function applyFilters() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var active = {};

            selects.forEach(function (select) {
                active[select.getAttribute("data-filter")] = select.value.toLowerCase();
            });

            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    valueOf(card, "title"),
                    valueOf(card, "region"),
                    valueOf(card, "type"),
                    valueOf(card, "genre"),
                    valueOf(card, "tags")
                ].join(" ");

                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchSelects = true;

                Object.keys(active).forEach(function (key) {
                    if (active[key] && valueOf(card, key) !== active[key]) {
                        matchSelects = false;
                    }
                });

                var shouldShow = matchQuery && matchSelects;
                card.style.display = shouldShow ? "" : "none";

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
    });

    function initPlayer(box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".play-button");
        var status = box.querySelector(".player-status");
        var loaded = false;
        var hls = null;

        if (!video || !button) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function playVideo() {
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setStatus("点击画面继续播放");
                });
            }

            box.classList.add("playing");
        }

        function loadStream() {
            var streamUrl = video.getAttribute("data-video-url") || "";

            if (!streamUrl) {
                setStatus("视频暂时无法播放");
                return;
            }

            setStatus("正在载入");

            if (loaded) {
                playVideo();
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                loaded = true;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    loaded = true;
                    playVideo();
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("视频暂时无法播放，请稍后重试");
                    }
                });

                return;
            }

            setStatus("当前设备暂不支持播放");
        }

        button.addEventListener("click", loadStream);

        video.addEventListener("click", function () {
            if (!loaded) {
                loadStream();
            }
        });

        video.addEventListener("play", function () {
            box.classList.add("playing");
            setStatus("");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                box.classList.remove("playing");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(initPlayer);
})();
