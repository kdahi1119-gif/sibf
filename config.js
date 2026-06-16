/**
 * SIBF Guide — 설정 파일
 * ──────────────────────────────────────────
 * ✏️ 아래 값들을 직접 수정하세요.
 */
const CONFIG = {
  /**
   * 지도 이미지 URL
   * sibf.kr/page/22 에서 부스 배치도 이미지 URL을 복사해 넣으세요.
   * 예) 'https://sibf.kr/upload/page/map2026.jpg'
   */
  mapImageUrl: '',

  /**
   * 부스 정보 Google Sheets CSV URL
   * Google Sheets → 파일 → 웹에 게시 → CSV 형식으로 게시 후 URL 복사
   *
   * 시트 컬럼 순서 (헤더 행 필수):
   * id | number | name | description | url | imageUrl | pinX | pinY
   *
   * pinX, pinY: 지도 이미지 기준 퍼센트 위치 (0~100)
   * 예) 지도 왼쪽 30%, 위에서 45% 위치면  pinX=30, pinY=45
   */
  boothsSheetUrl: '',

  /**
   * 프로그램 일정 Google Sheets CSV URL
   *
   * 시트 컬럼 순서 (헤더 행 필수):
   * date | time | endTime | venue | type | title | speaker | seats | link
   *
   * date 형식: 2026-06-24
   * time/endTime 형식: 10:00
   */
  scheduleSheetUrl: '',

  /**
   * 행사 날짜 목록
   */
  eventDays: [
    { label: '6/24 수', date: '2026-06-24' },
    { label: '6/25 목', date: '2026-06-25' },
    { label: '6/26 금', date: '2026-06-26' },
    { label: '6/27 토', date: '2026-06-27' },
    { label: '6/28 일', date: '2026-06-28' },
  ],
};
