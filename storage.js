/**
 * SIBF Guide — Storage
 * localStorage를 사용해 닉네임 및 위시리스트를 저장합니다.
 * 닉네임별로 완전히 분리된 데이터를 유지합니다.
 */
const Storage = (() => {
  const NICKNAMES_KEY = 'sibf_nicknames';   // 등록된 닉네임 목록
  const SESSION_KEY   = 'sibf_current_user'; // 현재 세션 닉네임
  const wishKey = (nick) => `sibf_wish_${nick}`;

  /* ── 닉네임 ── */
  function getNicknames() {
    try { return JSON.parse(localStorage.getItem(NICKNAMES_KEY)) || []; }
    catch { return []; }
  }
  function isNicknameTaken(nick) {
    return getNicknames().map(n => n.toLowerCase()).includes(nick.toLowerCase());
  }
  function registerNickname(nick) {
    if (isNicknameTaken(nick)) return false;
    const list = getNicknames();
    list.push(nick);
    localStorage.setItem(NICKNAMES_KEY, JSON.stringify(list));
    return true;
  }

  /* ── 세션 (현재 사용자) ── */
  function getCurrentUser() {
    return sessionStorage.getItem(SESSION_KEY) || null;
  }
  function setCurrentUser(nick) {
    sessionStorage.setItem(SESSION_KEY, nick);
  }

  /* ── 위시리스트 ── */
  function getWishlist(nick) {
    if (!nick) return [];
    try { return JSON.parse(localStorage.getItem(wishKey(nick))) || []; }
    catch { return []; }
  }
  function setWishlist(nick, ids) {
    if (!nick) return;
    localStorage.setItem(wishKey(nick), JSON.stringify(ids));
  }
  function addToWishlist(nick, boothId) {
    const list = getWishlist(nick);
    if (!list.includes(boothId)) {
      list.push(boothId);
      setWishlist(nick, list);
    }
  }
  function removeFromWishlist(nick, boothId) {
    const list = getWishlist(nick).filter(id => id !== boothId);
    setWishlist(nick, list);
  }
  function isWishlisted(nick, boothId) {
    return getWishlist(nick).includes(boothId);
  }

  return {
    isNicknameTaken,
    registerNickname,
    getCurrentUser,
    setCurrentUser,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
  };
})();
