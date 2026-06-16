/**
 * SIBF Guide — Map
 * 지도 이미지 위에 부스 핀을 렌더링하고 클릭 이벤트를 처리합니다.
 * 지도 이미지가 없어도 부스 목록 검색이 가능합니다.
 */
const MapView = (() => {
  let _booths = [];
  let _onBoothClick = null;

  const $wrapper     = document.getElementById('map-wrapper');
  const $image       = document.getElementById('map-image');
  const $pins        = document.getElementById('booth-pins');
  const $loading     = document.getElementById('map-loading');
  const $placeholder = document.getElementById('map-placeholder');
  const $search      = document.getElementById('booth-search');

  // 검색 결과 드롭다운 생성
  const $dropdown = document.createElement('div');
  $dropdown.id = 'search-dropdown';
  $dropdown.style.cssText = `
    position:absolute; top:100%; left:0; right:0;
    background:#fff; border:1.5px solid #ddd; border-radius:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.12); z-index:50;
    max-height:240px; overflow-y:auto; display:none; margin-top:4px;
  `;

  function init(booths, onBoothClick) {
    _booths = booths;
    _onBoothClick = onBoothClick;

    // 검색창 래퍼에 드롭다운 붙이기
    const searchWrap = $search.parentElement;
    searchWrap.style.position = 'relative';
    searchWrap.appendChild($dropdown);

    if (!CONFIG.mapImageUrl) {
      $loading.classList.add('hidden');
      $placeholder.classList.remove('hidden');
    } else {
      $image.src = CONFIG.mapImageUrl;
      $image.onload = () => {
        $loading.classList.add('hidden');
        renderPins();
      };
      $image.onerror = () => {
        $loading.classList.add('hidden');
        $placeholder.classList.remove('hidden');
      };
    }

    setupSearch();
  }

  function renderPins() {
    $pins.innerHTML = '';
    const user = Storage.getCurrentUser();
    _booths.forEach(booth => {
      if (!booth.pinX && !booth.pinY) return;
      const pin = document.createElement('div');
      pin.className = 'booth-pin' + (Storage.isWishlisted(user, booth.id) ? ' wish' : '');
      pin.style.left = booth.pinX + '%';
      pin.style.top  = booth.pinY + '%';
      pin.dataset.id = booth.id;
      pin.title = `${booth.number} ${booth.name}`;

      const label = document.createElement('div');
      label.className = 'booth-pin-label';
      label.textContent = booth.number;
      pin.appendChild(label);

      pin.addEventListener('click', () => _onBoothClick && _onBoothClick(booth));
      $pins.appendChild(pin);
    });
  }

  function refresh() {
    if (CONFIG.mapImageUrl && $image.complete && $image.naturalWidth > 0) {
      renderPins();
    }
  }

  function highlightPin(boothId, isWish) {
    const pin = $pins.querySelector(`[data-id="${boothId}"]`);
    if (pin) {
      if (isWish) pin.classList.add('wish');
      else pin.classList.remove('wish');
    }
  }

  function setupSearch() {
    $search.addEventListener('input', () => {
      const q = $search.value.trim().toLowerCase();

      // 핀 필터링
      $pins.querySelectorAll('.booth-pin').forEach(pin => {
        const booth = _booths.find(b => b.id === pin.dataset.id);
        if (!booth) return;
        const match = !q || booth.name.toLowerCase().includes(q) || booth.number.toLowerCase().includes(q);
        pin.style.opacity = match ? '1' : '0.15';
        pin.style.zIndex  = match && q ? '5' : '';
      });

      // 드롭다운 결과
      if (!q) { $dropdown.style.display = 'none'; return; }
      const results = _booths.filter(b =>
        b.name.toLowerCase().includes(q) || b.number.toLowerCase().includes(q)
      ).slice(0, 8);

      if (results.length === 0) {
        $dropdown.innerHTML = `<div style="padding:14px 16px;color:#999;font-size:14px;">검색 결과 없음</div>`;
      } else {
        $dropdown.innerHTML = results.map(b => `
          <div class="search-item" data-id="${b.id}" style="
            padding:12px 16px; cursor:pointer; display:flex; align-items:center; gap:10px;
            border-bottom:1px solid #f0f0f0; transition:background .12s;
          ">
            <span style="background:#2e3192;color:#fff;font-size:10px;font-weight:700;
              padding:2px 8px;border-radius:20px;flex-shrink:0;">${b.number}</span>
            <span style="font-size:14px;color:#1a1a2e;">${b.name}</span>
          </div>
        `).join('');
        $dropdown.querySelectorAll('.search-item').forEach(item => {
          item.addEventListener('mouseenter', () => item.style.background = '#f5f3ee');
          item.addEventListener('mouseleave', () => item.style.background = '');
          item.addEventListener('click', () => {
            const booth = _booths.find(b => b.id === item.dataset.id);
            if (booth) { _onBoothClick && _onBoothClick(booth); }
            $dropdown.style.display = 'none';
            $search.value = '';
          });
        });
      }
      $dropdown.style.display = 'block';
    });

    // 검색창 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', e => {
      if (!$search.parentElement.contains(e.target)) {
        $dropdown.style.display = 'none';
      }
    });
  }

  return { init, refresh, highlightPin };
})();
