/**
 * SIBF Guide — Sheets
 * Google Sheets 공개 CSV를 불러와 파싱합니다.
 */
const Sheets = (() => {

  /**
   * CSV 텍스트를 객체 배열로 파싱합니다.
   * 첫 번째 행을 헤더로 사용합니다.
   */
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = splitCSVLine(lines[0]);
    return lines.slice(1)
      .map(line => {
        const values = splitCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
        return obj;
      })
      .filter(row => Object.values(row).some(v => v !== ''));
  }

  /**
   * CSV 한 줄을 필드 배열로 분리합니다 (쉼표·따옴표 처리 포함).
   */
  function splitCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  /**
   * URL에서 CSV를 가져와 파싱한 결과를 반환합니다.
   */
  async function fetchCSV(url) {
    if (!url) return [];
    // Google Sheets 게시 URL → CSV 직접 다운로드로 변환
    const csvUrl = url.includes('output=csv') ? url
      : url.replace('/edit', '/export?format=csv')
           .replace('/pub?', '/pub?output=csv&');
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    const text = await res.text();
    return parseCSV(text);
  }

  /**
   * 부스 데이터를 가져옵니다.
   * 반환 형식: [{ id, number, name, description, url, imageUrl, pinX, pinY }, ...]
   */
  async function fetchBooths() {
    const rows = await fetchCSV(CONFIG.boothsSheetUrl);
    return rows.map(r => ({
      id:          r.id          || r.number || String(Math.random()),
      number:      r.number      || '',
      name:        r.name        || '',
      description: r.description || '',
      url:         r.url         || '',
      imageUrl:    r.imageUrl    || '',
      pinX:        parseFloat(r.pinX) || 0,
      pinY:        parseFloat(r.pinY) || 0,
    })).filter(b => b.name);
  }

  /**
   * 프로그램 일정을 가져옵니다.
   * 반환 형식: [{ date, time, endTime, venue, type, title, speaker, seats, link }, ...]
   */
  async function fetchSchedule() {
    const rows = await fetchCSV(CONFIG.scheduleSheetUrl);
    return rows.map(r => ({
      date:     r.date     || '',
      time:     r.time     || '',
      endTime:  r.endTime  || '',
      venue:    r.venue    || '',
      type:     r.type     || '',
      title:    r.title    || '',
      speaker:  r.speaker  || '',
      seats:    r.seats    || '',
      link:     r.link     || '',
    })).filter(e => e.date && e.title);
  }

  return { fetchBooths, fetchSchedule };
})();
