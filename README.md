# 📚 SIBF 2026 가이드 — 서울국제도서전 방문객 도우미

> 2026 서울국제도서전(6/24~28, 코엑스)을 방문하는 분들을 위한 웹 가이드입니다.
> 부스 지도 탐색 · 위시리스트 저장 · 프로그램 일정 확인 기능을 제공합니다.

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 이 저장소를 Fork 또는 Clone

```bash
git clone https://github.com/YOUR_USERNAME/sibf-guide.git
cd sibf-guide
```

### 2단계 — GitHub Pages 활성화

1. GitHub 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)` 선택 후 Save
4. 잠시 후 `https://YOUR_USERNAME.github.io/sibf-guide/` 에서 접속 가능

---

## ⚙️ 데이터 연동 방법

### 지도 이미지 설정

1. [sibf.kr/page/22](https://sibf.kr/page/22) 에서 부스 배치도 이미지를 다운로드
2. 저장소에 `images/map.jpg` 로 업로드 (또는 외부 이미지 URL 사용)
3. `js/config.js` 의 `mapImageUrl` 값 수정:

```js
mapImageUrl: './images/map.jpg',
// 또는 외부 URL: 'https://example.com/map.jpg'
```

### 부스 정보 스프레드시트 설정

1. 아래 Google Sheets 템플릿을 복사하세요:  
   **[▶ 부스 정보 템플릿 복사](https://docs.google.com/spreadsheets/d/1예시ID/copy)**

2. 컬럼 형식 (헤더 행 필수):

| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| `id` | 고유 ID (부스번호와 동일하게) | A101 |
| `number` | 부스 번호 | A101 |
| `name` | 부스명 (출판사/기관명) | 민음사 |
| `description` | 부스 설명 (1~3문장) | 국내 대표 종합출판사입니다. |
| `url` | 공식 웹사이트 URL | https://minumsa.com |
| `imageUrl` | 대표 이미지 URL | https://... |
| `pinX` | 지도 위 핀 X 위치 (%) | 35.5 |
| `pinY` | 지도 위 핀 Y 위치 (%) | 42.0 |

> **핀 위치(pinX, pinY) 설정 팁**: 지도 이미지를 열고 각 부스 위치의 전체 이미지 대비 퍼센트 위치를 입력하세요.  
> 예) 지도 너비 1000px 중 350px 위치 → pinX = 35

3. **파일 → 웹에 게시 → 쉼표로 구분된 값(.csv) → 게시** 후 URL 복사
4. `js/config.js` 의 `boothsSheetUrl` 에 붙여넣기

### 프로그램 일정 스프레드시트 설정

컬럼 형식:

| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| `date` | 날짜 | 2026-06-24 |
| `time` | 시작 시간 | 11:00 |
| `endTime` | 종료 시간 | 12:00 |
| `venue` | 장소명 | 책만남홀1 |
| `type` | 프로그램 유형 | 강연 / 워크숍 / 세미나 / 개막식 / 시상식 |
| `title` | 프로그램 제목 | AI 시대의 윤리와 저작권 |
| `speaker` | 연사 | 니콜라 로슈 (프랑스 출판네트워크) |
| `seats` | 잔여석 정보 | 20/50 또는 마감 |
| `link` | 예약/상세 URL | https://sibf.kr/page/33 |

위와 동일하게 CSV로 게시 후 `js/config.js` 의 `scheduleSheetUrl` 에 입력하세요.

---

## 🗂️ 프로젝트 구조

```
sibf-guide/
├── index.html          # 메인 HTML
├── css/
│   └── style.css       # 디자인 시스템
├── js/
│   ├── config.js       # ✏️ 여기서 URL 설정
│   ├── storage.js      # localStorage (닉네임·위시리스트)
│   ├── sheets.js       # Google Sheets CSV 파싱
│   ├── map.js          # 지도 + 부스 핀
│   ├── schedule.js     # 프로그램 시간표
│   ├── wishlist.js     # 위시리스트 뷰
│   └── app.js          # 메인 앱 로직
└── images/
    └── map.jpg         # 부스 배치도 이미지 (직접 추가)
```

---

## 🔑 사용자 닉네임 & 위시리스트

- 닉네임은 브라우저 `localStorage` 에 저장됩니다.
- **같은 브라우저·같은 기기** 에서 동일 닉네임으로 재접속하면 위시리스트가 유지됩니다.
- 다른 기기에서는 위시리스트가 공유되지 않습니다.
- 중복 닉네임 방지: 처음 닉네임을 등록하면 같은 이름은 재등록 불가합니다.  
  (단, 해당 닉네임으로 위시리스트 데이터가 있으면 재로그인으로 처리됩니다.)

---

## 📌 주요 기능 요약

| 기능 | 설명 |
|------|------|
| 🗺 부스 지도 | 전체 배치도 위에 부스 핀 표시, 검색 필터 |
| 🔍 부스 상세 | 클릭 시 이미지·번호·이름·설명·URL 팝업 |
| ⭐ 위시리스트 | 닉네임별 저장, 지도에서 빨간 핀으로 표시 |
| 📅 프로그램 | 날짜별 시간표 형식, 유형별 컬러 코딩 |

---

2026 서울국제도서전 | 2026. 6. 24(수) – 6. 28(일) | 코엑스 A&B1홀
