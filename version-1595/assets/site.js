(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            setHero(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(heroIndex + 1);
        }, 5200);
    }

    const searchInput = document.querySelector('[data-card-search]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const regionFilter = document.querySelector('[data-region-filter]');
    const cards = Array.from(document.querySelectorAll('.searchable-cards [data-title]'));

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function updateCards() {
        const keyword = normalize(searchInput ? searchInput.value : '');
        const year = normalize(yearFilter ? yearFilter.value : '');
        const type = normalize(typeFilter ? typeFilter.value : '');
        const region = normalize(regionFilter ? regionFilter.value : '');

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.textContent
            ].join(' '));
            const passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const passYear = !year || normalize(card.dataset.year) === year;
            const passType = !type || normalize(card.dataset.type) === type;
            const passRegion = !region || normalize(card.dataset.region) === region;
            card.classList.toggle('is-filter-hidden', !(passKeyword && passYear && passType && passRegion));
        });
    }

    [searchInput, yearFilter, typeFilter, regionFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', updateCards);
            control.addEventListener('change', updateCards);
        }
    });
}());

function startPlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const stream = options.stream;
    let attached = false;
    let hlsInstance = null;

    function attachStream() {
        if (attached || !video || !stream) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                backBufferLength: 30
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function playVideo() {
        if (!video || !button) {
            return;
        }

        attachStream();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

window.startPlayer = startPlayer;
