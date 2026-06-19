import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $("[data-menu-toggle]");
  const menu = $("[data-mobile-menu]");
  if (!button || !menu) return;

  button.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function initHeroSlider() {
  const hero = $("[data-hero]");
  if (!hero) return;

  const slides = $$("[data-hero-slide]", hero);
  const dots = $$("[data-hero-dot]", hero);
  if (slides.length <= 1) return;

  let index = 0;
  let timer = null;

  const activate = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => activate(index + 1), 5200);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      activate(i);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

function initPlayer() {
  const cards = $$('[data-player]');
  cards.forEach((card) => {
    const video = $("video", card);
    const button = $("[data-player-start]", card);
    const message = $("[data-player-message]", card);
    const source = card.dataset.src;
    let hls = null;
    let loaded = false;

    const showMessage = (text) => {
      if (!message) return;
      message.textContent = text;
      message.classList.add("is-visible");
    };

    const hideMessage = () => {
      if (!message) return;
      message.textContent = "";
      message.classList.remove("is-visible");
    };

    const attachSource = () => {
      if (loaded) return true;
      if (!video || !source) {
        showMessage("当前影片暂未配置可播放地址。");
        return false;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              showMessage("网络加载异常，正在尝试恢复播放。");
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              showMessage("媒体解析异常，正在尝试恢复。");
              hls.recoverMediaError();
            } else {
              showMessage("视频播放失败，请稍后重试。");
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showMessage("当前浏览器不支持 HLS/m3u8 播放。");
        return false;
      }

      loaded = true;
      return true;
    };

    const play = async () => {
      hideMessage();
      if (!attachSource()) return;
      try {
        await video.play();
        card.classList.add("is-playing");
      } catch (error) {
        showMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
      }
    };

    if (button) button.addEventListener("click", play);
    if (video) {
      video.addEventListener("click", () => {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", () => card.classList.add("is-playing"));
      video.addEventListener("pause", () => card.classList.remove("is-playing"));
      video.addEventListener("ended", () => card.classList.remove("is-playing"));
    }

    window.addEventListener("pagehide", () => {
      if (hls) hls.destroy();
    });
  });
}

function initLocalFilters() {
  const panel = $("[data-filter-panel]");
  const grid = $("[data-card-grid]");
  if (!panel || !grid) return;

  const input = $("[data-local-search]", panel);
  const yearSelect = $("[data-year-filter]", panel);
  const typeSelect = $("[data-type-filter]", panel);
  const resetButton = $("[data-reset-filter]", panel);
  const count = $("[data-filter-count]");
  const emptyState = $("[data-empty-state]");
  const cards = $$(".movie-card", grid);

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const apply = () => {
    const query = normalize(input && input.value);
    const year = yearSelect ? yearSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.search);
      const yearMatch = !year || card.dataset.year === year;
      const typeMatch = !type || card.dataset.type === type;
      const queryMatch = !query || text.includes(query);
      const shouldShow = yearMatch && typeMatch && queryMatch;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    if (count) count.textContent = `共 ${visible} 部影片`;
    if (emptyState) emptyState.hidden = visible > 0;
  };

  if (input) input.addEventListener("input", apply);
  if (yearSelect) yearSelect.addEventListener("change", apply);
  if (typeSelect) typeSelect.addEventListener("change", apply);
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (input) input.value = "";
      if (yearSelect) yearSelect.value = "";
      if (typeSelect) typeSelect.value = "";
      apply();
    });
  }
}

function createSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="movie-card">
      <a class="poster-link" href="detail/${movie.id}.html" title="${escapeHtml(movie.title)} 在线观看">
        <span class="poster-frame">
          <img src="${movie.image}.jpg" alt="${escapeHtml(movie.title)}封面" loading="lazy" onerror="this.closest('.poster-frame').classList.add('poster-missing'); this.remove();">
          <span class="play-chip">立即观看</span>
        </span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="detail/${movie.id}.html">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initSearchPage() {
  const results = $("[data-search-results]");
  const summary = $("[data-search-summary]");
  const input = $("[data-search-input]");
  if (!results || !summary) return;

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) input.value = query;

  if (!query) {
    summary.textContent = "请输入关键词开始搜索。";
    return;
  }

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const movies = Array.isArray(window.SITE_MOVIES_INDEX) ? window.SITE_MOVIES_INDEX : [];
  const matches = movies.filter((movie) => {
    const haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });

  summary.textContent = `搜索“${query}”找到 ${matches.length} 部影片。`;
  results.innerHTML = matches.slice(0, 240).map(createSearchCard).join("");

  if (matches.length > 240) {
    summary.textContent += " 当前显示前 240 条结果，可继续增加关键词缩小范围。";
  }
}

function initScrollPlayerButtons() {
  const buttons = $$('[data-scroll-player]');
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const player = $("[data-player]");
      if (player) {
        player.scrollIntoView({ behavior: "smooth", block: "center" });
        const start = $("[data-player-start]", player);
        if (start) window.setTimeout(() => start.click(), 280);
      }
    });
  });
}

initMobileMenu();
initHeroSlider();
initPlayer();
initLocalFilters();
initSearchPage();
initScrollPlayerButtons();
