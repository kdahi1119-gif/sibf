/**
 * SIBF Guide — App (메인 진입점)
 */
document.addEventListener('DOMContentLoaded', async () => {

  let allBooths   = [];
  let allSchedule = [];
  let scheduleLoaded = false;

  /* ── DOM ── */
  const $views           = document.querySelectorAll('.view');
  const $navBtns         = document.querySelectorAll('.nav-btn');
  const $nicknameModal   = document.getElementById('nickname-modal');
  const $nicknameInput   = document.getElementById('nickname-input');
  const $nicknameError   = document.getElementById('nickname-error');
  const $nicknameBtn     = document.getElementById('nickname-btn');
  const $nicknameConfirm = document.getElementById('nickname-confirm');
  const $nicknameCancel  = document.getElementById('nickname-cancel');
  const $userGreeting    = document.getElementById('user-greeting');
  const $boothModal      = document.getElementById('booth-modal');
  const $boothClose      = document.getElementById('booth-close');
  const $boothImg        = document.getElementById('booth-img');
  const $boothImgWrap    = document.querySelector('.booth-image-wrap');
  const $boothNumber     = document.getElementById('booth-number');
  const $boothName       = document.getElementById('booth-name');
  const $boothDesc       = document.getElementById('booth-desc');
  const $boothUrl        = document.getElementById('booth-url');
  const $boothWishBtn    = document.getElementById('booth-wishlist-btn');

  let currentBooth = null;

  /* ══════════════════════════════════════
     뷰 전환
  ══════════════════════════════════════ */
  function switchView(name) {
    $views.forEach(v => {
      const isTarget = v.id === 'view-' + name;
      v.classList.toggle('active', isTarget);
      v.classList.toggle('hidden', !isTarget);
    });
    $navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));

    if (name === 'wishlist') WishlistView.render();
    if (name === 'schedule' && !scheduleLoaded) loadSchedule();
  }

  $navBtns.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

  /* ══════════════════════════════════════
     닉네임 모달
  ══════════════════════════════════════ */
  window.openNicknameModal = () => {
    $nicknameInput.value = '';
    $nicknameError.classList.add('hidden');
    $nicknameModal.classList.remove('hidden');
    setTimeout(() => $nicknameInput.focus(), 50);
  };

  $nicknameBtn.addEventListener('click', openNicknameModal);
  $nicknameCancel.addEventListener('click', () => $nicknameModal.classList.add('hidden'));
  $nicknameModal.addEventListener('click', e => {
    if (e.target === $nicknameModal) $nicknameModal.classList.add('hidden');
  });
  $nicknameInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmNickname(); });
  $nicknameConfirm.addEventListener('click', confirmNickname);

  function confirmNickname() {
    const nick = $nicknameInput.value.trim();
    if (nick.length < 2 || nick.length > 12) {
      return showNickError('닉네임은 2~12자로 입력해 주세요.');
    }
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(nick)) {
      return showNickError('한글, 영문, 숫자, _만 사용할 수 있어요.');
    }

    const taken = Storage.isNicknameTaken(nick);
    if (taken) {
      // 이미 등록된 닉네임 → 위시 데이터가 있으면 재로그인, 없으면 중복 오류
      const hasData = Storage.getWishlist(nick).length > 0;
      if (!hasData) {
        return showNickError('이미 사용 중인 닉네임이에요. 다른 닉네임을 선택해 주세요.');
      }
      // 데이터 있는 경우 재로그인 허용
    } else {
      Storage.registerNickname(nick);
    }

    Storage.setCurrentUser(nick);
    $nicknameModal.classList.add('hidden');
    updateUserUI();
    MapView.refresh();
    WishlistView.render();
  }

  function showNickError(msg) {
    $nicknameError.textContent = msg;
    $nicknameError.classList.remove('hidden');
  }

  function updateUserUI() {
    const user = Storage.getCurrentUser();
    if (user) {
      $userGreeting.textContent = `👤 ${user}`;
      $userGreeting.classList.remove('hidden');
      $nicknameBtn.textContent = '닉네임 변경';
    } else {
      $userGreeting.classList.add('hidden');
      $nicknameBtn.textContent = '닉네임 설정';
    }
  }

  /* ══════════════════════════════════════
     부스 상세 모달
  ══════════════════════════════════════ */
  function openBoothModal(booth) {
    currentBooth = booth;
    const user = Storage.getCurrentUser();

    // 이미지
    if (booth.imageUrl) {
      $boothImg.src = booth.imageUrl;
      $boothImg.style.display = 'block';
      $boothImgWrap.style.display = 'block';
    } else {
      $boothImgWrap.style.display = 'none';
    }

    $boothNumber.textContent = booth.number ? `부스 ${booth.number}` : '';
    $boothName.textContent   = booth.name;
    $boothDesc.textContent   = booth.description || '설명이 없습니다.';

    if (booth.url) {
      const href = booth.url.startsWith('http') ? booth.url : 'https://' + booth.url;
      $boothUrl.href = href;
      $boothUrl.style.display = 'inline';
    } else {
      $boothUrl.style.display = 'none';
    }

    updateWishBtn(booth, user);
    $boothModal.classList.remove('hidden');
  }

  function updateWishBtn(booth, user) {
    if (!user) {
      $boothWishBtn.textContent = '⭐ 위시리스트에 추가 (닉네임 필요)';
      $boothWishBtn.classList.remove('active');
      return;
    }
    const isWished = Storage.isWishlisted(user, booth.id);
    $boothWishBtn.textContent = isWished ? '✅ 위시리스트에 저장됨' : '⭐ 위시리스트에 추가';
    $boothWishBtn.classList.toggle('active', isWished);
  }

  $boothClose.addEventListener('click', () => $boothModal.classList.add('hidden'));
  $boothModal.addEventListener('click', e => {
    if (e.target === $boothModal) $boothModal.classList.add('hidden');
  });

  $boothWishBtn.addEventListener('click', () => {
    const user = Storage.getCurrentUser();
    if (!user) { openNicknameModal(); return; }
    if (!currentBooth) return;

    const isWished = Storage.isWishlisted(user, currentBooth.id);
    if (isWished) {
      Storage.removeFromWishlist(user, currentBooth.id);
      showToast('위시리스트에서 제거했어요');
      MapView.highlightPin(currentBooth.id, false);
    } else {
      Storage.addToWishlist(user, currentBooth.id);
      showToast('⭐ 위시리스트에 추가했어요!');
      MapView.highlightPin(currentBooth.id, true);
    }
    updateWishBtn(currentBooth, user);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $boothModal.classList.add('hidden');
      $nicknameModal.classList.add('hidden');
    }
  });

  /* ══════════════════════════════════════
     데이터 로드
  ══════════════════════════════════════ */
  async function loadBooths() {
    try {
      allBooths = CONFIG.boothsSheetUrl
        ? await Sheets.fetchBooths()
        : SAMPLE_BOOTHS;
    } catch (e) {
      console.warn('부스 데이터 로드 실패, 샘플 사용:', e);
      allBooths = SAMPLE_BOOTHS;
    }
    MapView.init(allBooths, openBoothModal);
    WishlistView.init(allBooths, openBoothModal);
    WishlistView.render();
  }

  async function loadSchedule() {
    scheduleLoaded = true;
    ScheduleView.showLoading();
    try {
      allSchedule = CONFIG.scheduleSheetUrl
        ? await Sheets.fetchSchedule()
        : SAMPLE_SCHEDULE;
      ScheduleView.init(allSchedule);
    } catch (e) {
      console.warn('일정 데이터 로드 실패, 샘플 사용:', e);
      ScheduleView.init(SAMPLE_SCHEDULE);
    }
  }

  /* ══════════════════════════════════════
     샘플 데이터 (스프레드시트 연동 전 미리보기)
  ══════════════════════════════════════ */
  const SAMPLE_BOOTHS = [
    { id:'A101', number:'A101', name:'고스트북스',  description:'독립출판 전문 출판사입니다.',      url:'https://ghost-books.com',  imageUrl:'', pinX:18, pinY:28 },
    { id:'A201', number:'A201', name:'민음사',      description:'국내 대표 종합출판사입니다.',      url:'https://minumsa.com',      imageUrl:'', pinX:36, pinY:28 },
    { id:'A301', number:'A301', name:'을유문화사',  description:'인문·사회 전문 출판사입니다.',     url:'https://eulyoo.com',       imageUrl:'', pinX:55, pinY:28 },
    { id:'B101', number:'B101', name:'문학동네',    description:'문학 전문 출판사입니다.',          url:'https://munhak.com',       imageUrl:'', pinX:25, pinY:55 },
    { id:'B201', number:'B201', name:'창비',        description:'창작과비평사입니다.',              url:'https://changbi.com',      imageUrl:'', pinX:45, pinY:55 },
    { id:'B301', number:'B301', name:'한길사',      description:'학술·교양 전문 출판사입니다.',     url:'https://hangilsa.co.kr',   imageUrl:'', pinX:65, pinY:55 },
    { id:'C101', number:'C101', name:'열린책들',    description:'세계문학 번역 전문 출판사입니다.', url:'https://openbooks.co.kr',  imageUrl:'', pinX:30, pinY:75 },
    { id:'C201', number:'C201', name:'교보문고',    description:'국내 최대 서점 체인입니다.',       url:'https://kyobobook.co.kr',  imageUrl:'', pinX:60, pinY:75 },
  ];

  const SAMPLE_SCHEDULE = [
    { date:'2026-06-24', time:'10:00', endTime:'10:30', venue:'책마당',      type:'개막식',  title:'2026 서울국제도서전 개막식',                                      speaker:'',                              seats:'',      link:'' },
    { date:'2026-06-24', time:'11:00', endTime:'12:00', venue:'책만남홀1',   type:'강연',    title:'AI 시대의 윤리와 저작권 : 출판 산업의 과제',                       speaker:'니콜라 로슈 (프랑스 출판네트워크)', seats:'0/50',  link:'' },
    { date:'2026-06-24', time:'13:00', endTime:'14:00', venue:'책만남홀2',   type:'워크숍',  title:'내가 기다리던 책의 순간 – 인벤토리 책갈피 만들기',                  speaker:'나소연 (일러스트레이터)',           seats:'마감',  link:'' },
    { date:'2026-06-24', time:'14:30', endTime:'15:30', venue:'책만남홀1',   type:'강연',    title:'세상의 모든 요리, 미식 문화는 어떻게 우리 삶 속에 이야기를 만드는가', speaker:'프랑수아 레지스 고드리',           seats:'0/50',  link:'' },
    { date:'2026-06-24', time:'16:00', endTime:'17:00', venue:'책만남홀2',   type:'강연',    title:'어떤 종의 기원담, 그리고 우리의 미래담 : 김보영 작가와의 만남',      speaker:'김보영 (소설가)',                  seats:'마감',  link:'' },
    { date:'2026-06-24', time:'14:00', endTime:'15:00', venue:'주빈 (A601)', type:'세미나',  title:'미래를 읽다 : 프랑스-한국의 책읽는 사회를 위한 공공정책',             speaker:'김진우 (한국출판문화산업진흥원)',   seats:'30/50', link:'' },
    { date:'2026-06-25', time:'11:00', endTime:'12:00', venue:'책만남홀1',   type:'강연',    title:'번역이란 무엇인가 – 언어를 건너는 글쓰기',                          speaker:'이주혜 (소설가·번역가)',            seats:'20/50', link:'' },
    { date:'2026-06-25', time:'14:00', endTime:'15:30', venue:'책만남홀2',   type:'워크숍',  title:'이다 작가와 함께하는 일상이 여행이 되는 기록법',                     speaker:'이다 (일러스트레이터)',             seats:'마감',  link:'' },
    { date:'2026-06-25', time:'16:00', endTime:'17:30', venue:'책만남홀1',   type:'강연',    title:'『건축의 K』 저자와 함께하는 K-미학 건축 탐구',                      speaker:'노은주·임형남 (건축가)',            seats:'10/50', link:'' },
    { date:'2026-06-26', time:'11:00', endTime:'12:00', venue:'책만남홀1',   type:'강연',    title:'SF로 읽는 기후 위기 – 상상력이 현실을 바꾼다',                       speaker:'배명훈 (소설가)',                  seats:'15/50', link:'' },
    { date:'2026-06-27', time:'11:00', endTime:'12:30', venue:'책마당',      type:'강연',    title:'글쓴이와 옮긴이 – 백수린·이주혜 대담',                              speaker:'백수린·이주혜',                    seats:'0/100', link:'' },
    { date:'2026-06-27', time:'14:00', endTime:'15:00', venue:'책만남홀2',   type:'워크숍',  title:'바캉스 \'이래도 되나\' 북콘서트',                                  speaker:'강혜숙·김유 (그림책 작가)',         seats:'마감',  link:'' },
    { date:'2026-06-28', time:'15:00', endTime:'16:00', venue:'책마당',      type:'시상식',  title:'2026 한국에서 가장 좋은 책 시상식',                                 speaker:'',                              seats:'',      link:'' },
  ];

  /* ══════════════════════════════════════
     초기화
  ══════════════════════════════════════ */
  updateUserUI();
  await loadBooths();
});

/* ── 토스트 알림 (전역) ── */
window.showToast = function(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tmr);
  t._tmr = setTimeout(() => t.classList.remove('show'), 2200);
};
