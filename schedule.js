/**
 * SIBF Guide — Schedule
 * 날짜별 탭 + 시간표 형식으로 프로그램 일정을 렌더링합니다.
 */
const ScheduleView = (() => {
  let _events = [];
  let _activeDay = CONFIG.eventDays[0]?.date || '';

  const $tabs    = document.getElementById('day-tabs');
  const $grid    = document.getElementById('schedule-grid');
  const $loading = document.getElementById('schedule-loading');
  const $empty   = document.getElementById('schedule-empty');

  const TYPE_COLORS = {
    '강연': '#2e3192',
    '세미나': '#7b5ea7',
    '워크숍': '#2d8a6e',
    '시상식': '#c8a86b',
    '개막식': '#c8466b',
    '해외': '#7b5ea7',
  };

  function init(events) {
    _events = events;
    $loading.classList.add('hidden');
    buildTabs();
    renderDay(_activeDay);
  }

  function buildTabs() {
    $tabs.innerHTML = '';
    CONFIG.eventDays.forEach((day, i) => {
      const btn = document.createElement('button');
      btn.className = 'day-tab' + (day.date === _activeDay ? ' active' : '');
      btn.textContent = day.label;
      btn.addEventListener('click', () => {
        _activeDay = day.date;
        $tabs.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDay(day.date);
      });
      $tabs.appendChild(btn);
    });
  }

  function renderDay(date) {
    $grid.innerHTML = '';
    $grid.classList.add('hidden');
    $empty.classList.add('hidden');

    const dayEvents = _events
      .filter(e => e.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (dayEvents.length === 0) {
      $empty.classList.remove('hidden');
      return;
    }

    // 시간대별로 그룹핑
    const byTime = {};
    dayEvents.forEach(e => {
      if (!byTime[e.time]) byTime[e.time] = [];
      byTime[e.time].push(e);
    });

    Object.entries(byTime).forEach(([time, events]) => {
      const block = document.createElement('div');
      block.className = 'time-block';

      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = time;
      block.appendChild(timeLabel);

      const eventsDiv = document.createElement('div');
      eventsDiv.className = 'time-events';

      events.forEach(ev => {
        const card = document.createElement('div');
        // type 키워드로 카드 색상 결정
        const typeKey = Object.keys(TYPE_COLORS).find(k => ev.type.includes(k)) || '';
        card.className = `event-card${typeKey ? ' type-' + typeKey : ''}`;

        const timeRange = ev.endTime ? `${ev.time}–${ev.endTime}` : ev.time;

        let seatsHtml = '';
        if (ev.seats) {
          const available = ev.seats.includes('잔여') || parseInt(ev.seats) > 0;
          seatsHtml = `<span class="event-seats ${available ? 'available' : ''}">
            ${ev.seats.includes('/') ? '🎟 ' + ev.seats : (available ? '🎟 잔여 ' + ev.seats + '석' : '🎟 마감')}
          </span>`;
        }

        card.innerHTML = `
          <span class="event-tag">${ev.type || '프로그램'}</span>
          <div class="event-title">${ev.link
            ? `<a href="${ev.link}" target="_blank" style="color:inherit;text-decoration:none;">${ev.title}</a>`
            : ev.title
          }</div>
          <div class="event-meta">
            <span class="event-venue">📍 ${ev.venue}</span>
            <span style="color:#999">${timeRange}</span>
            ${ev.speaker ? `<span class="event-speaker">👤 ${ev.speaker}</span>` : ''}
            ${seatsHtml}
          </div>
        `;
        eventsDiv.appendChild(card);
      });

      block.appendChild(eventsDiv);
      $grid.appendChild(block);
    });

    $grid.classList.remove('hidden');
  }

  function showLoading() {
    $loading.classList.remove('hidden');
    $grid.classList.add('hidden');
    $empty.classList.add('hidden');
  }

  function showError() {
    $loading.classList.add('hidden');
    $empty.classList.remove('hidden');
    $empty.querySelector('p').textContent = '⚠️ 일정을 불러오지 못했습니다. 설정을 확인해 주세요.';
  }

  return { init, showLoading, showError };
})();
