/**
 * SIBF Guide — Wishlist
 * 현재 사용자의 위시리스트를 카드 그리드로 렌더링합니다.
 */
const WishlistView = (() => {
  let _booths = [];
  let _onCardClick = null;

  const $loginPrompt = document.getElementById('wishlist-login-prompt');
  const $content     = document.getElementById('wishlist-content');
  const $empty       = document.getElementById('wishlist-empty');
  const $grid        = document.getElementById('wishlist-grid');
  const $owner       = document.getElementById('wishlist-owner');

  function init(booths, onCardClick) {
    _booths = booths;
    _onCardClick = onCardClick;
  }

  function render() {
    const user = Storage.getCurrentUser();
    if (!user) {
      $loginPrompt.classList.remove('hidden');
      $content.classList.add('hidden');
      return;
    }
    $loginPrompt.classList.add('hidden');
    $content.classList.remove('hidden');
    $owner.textContent = `${user} 님의 위시리스트`;

    const ids = Storage.getWishlist(user);
    const wishedBooths = _booths.filter(b => ids.includes(b.id));

    $grid.innerHTML = '';
    if (wishedBooths.length === 0) {
      $empty.classList.remove('hidden');
      return;
    }
    $empty.classList.add('hidden');

    wishedBooths.forEach(booth => {
      const card = document.createElement('div');
      card.className = 'wish-card';

      const img = document.createElement('img');
      img.className = 'wish-card-img';
      img.src = booth.imageUrl || '';
      img.alt = booth.name;
      img.onerror = () => { img.style.background = '#e8e4d9'; img.src = ''; };

      const body = document.createElement('div');
      body.className = 'wish-card-body';
      body.innerHTML = `
        <div class="wish-card-number">${booth.number}</div>
        <div class="wish-card-name">${booth.name}</div>
        <div class="wish-card-desc">${booth.description}</div>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'wish-card-remove';
      removeBtn.textContent = '위시리스트에서 제거';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Storage.removeFromWishlist(user, booth.id);
        MapView.highlightPin(booth.id, false);
        render();
      });

      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(removeBtn);
      card.addEventListener('click', () => _onCardClick && _onCardClick(booth));
      $grid.appendChild(card);
    });
  }

  return { init, render };
})();
