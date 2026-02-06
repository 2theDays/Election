# 충북 지역 신문사 RSS 주소 찾기 가이드

## 방법 1: 신문사 웹사이트에서 직접 찾기

### 1단계: 신문사 사이트 방문
예: http://www.inews365.com (충북일보)

### 2단계: RSS 찾는 3가지 방법

#### A. 페이지 하단 찾기
- 대부분 신문사는 하단에 RSS 아이콘 있음
- 오렌지색 아이콘 찾기

#### B. 소스 코드에서 찾기
1. 웹사이트에서 마우스 우클릭
2. "페이지 소스 보기" 클릭
3. Ctrl+F로 검색: "rss" 또는 "xml"
4. <link rel="alternate" type="application/rss+xml" 찾기
5. href=" " 안에 있는 주소가 RSS 주소

#### C. 크롬 확장 프로그램 사용
1. 크롬 웹스토어에서 "Get RSS Feed URL" 설치
2. 신문사 사이트 방문
3. 확장 프로그램 아이콘 클릭
4. RSS 주소 자동 표시

### 3단계: 주소 테스트
- 브라우저 주소창에 RSS 주소 입력
- XML 형식 페이지 보이면 성공!

---

## 방법 2: 일반적인 RSS 주소 패턴

대부분의 신문사는 이런 패턴 사용:

```
http://신문사주소/rss/allArticle.xml
http://신문사주소/rss/S1N1.xml (정치)
http://신문사주소/rss/S1N2.xml (경제)
http://신문사주소/feed
http://신문사주소/rss
```

**시도해볼 주소:**
```
http://www.inews365.com/rss/allArticle.xml
http://www.joongdo.co.kr/rss/allArticle.xml
http://www.cctoday.co.kr/rss/allArticle.xml
http://www.jbnews.com/rss/allArticle.xml
http://www.cctimes.kr/rss/allArticle.xml
```

---

## 방법 3: 구글 알림 RSS 사용 (강력 추천!)

### 장점:
- 특정 키워드 자동 수집
- 모든 언론사 통합
- 실시간 업데이트
- **가장 안정적!**

### 설정 방법:

#### 1단계: 구글 알림 페이지 접속
https://www.google.com/alerts

#### 2단계: 알림 생성
```
검색어 입력: "신용한 충북도지사"
결과 표시: 모든 결과
소스: 뉴스
언어: 한국어
지역: 대한민국
빈도: 수시로
수신 위치: RSS 피드 선택 ← 중요!
```

#### 3단계: "알림 만들기" 클릭

#### 4단계: RSS 주소 복사
- 생성된 알림 옆의 RSS 아이콘 우클릭
- "링크 주소 복사"
- 주소 형식: https://www.google.com/alerts/feeds/xxxxx/xxxxx

#### 5단계: 각 후보자별로 반복
```
"노영민 충북도지사"
"송기섭 충북도지사"
"한범덕 충북도지사"
"윤희근 충북도지사"
"이종배 충북도지사"
"충북도지사 선거"
"2026 충북도지사"
```

---

## 실제 사용 방법

### local_news_crawler.py 파일 수정:

1. 파일 열기 (메모장)

2. GOOGLE_ALERTS_RSS 부분 찾기 (약 50번째 줄)

3. 구글 알림에서 복사한 RSS 주소 입력:

```python
GOOGLE_ALERTS_RSS = [
    "https://www.google.com/alerts/feeds/12345678/신용한충북도지사",
    "https://www.google.com/alerts/feeds/12345678/노영민충북도지사",
    "https://www.google.com/alerts/feeds/12345678/송기섭충북도지사",
    "https://www.google.com/alerts/feeds/12345678/한범덕충북도지사",
    "https://www.google.com/alerts/feeds/12345678/충북도지사선거",
]
```

4. 저장

5. 실행:
```bash
python local_news_crawler.py
```

---

## 테스트용 RSS 주소 확인

실제 작동하는 RSS 주소를 찾으려면:

### A. feedparser 라이브러리로 테스트
```python
import feedparser

# 테스트할 주소
test_url = "http://www.inews365.com/rss/allArticle.xml"

# 파싱 시도
feed = feedparser.parse(test_url)

# 결과 확인
if feed.entries:
    print(f"✅ 성공! {len(feed.entries)}개 기사 발견")
    print("첫 기사:", feed.entries[0].title)
else:
    print("❌ 실패 - RSS 주소 오류")
```

### B. 브라우저에서 직접 확인
1. RSS 주소를 브라우저 주소창에 입력
2. XML 페이지가 보이면 성공!
3. 404 오류 또는 빈 페이지면 주소 틀림

---

## 추천 전략

### 최고 효율: 구글 알림 RSS만 사용
```python
# local_news_crawler.py 에서

# 지역 신문사 RSS는 주석 처리 (안 되는 경우)
# REGIONAL_NEWS_SOURCES = {...}

# 구글 알림만 사용
GOOGLE_ALERTS_RSS = [
    "주소1",
    "주소2",
    ...
]
```

**장점:**
- 설정 1회만 하면 됨
- 모든 언론사 자동 통합
- 안정적
- 키워드 맞춤형

---

## 문제 해결

### Q: RSS 주소를 못 찾겠어요
A: 구글 알림 RSS 사용 (가장 간단!)

### Q: 기사가 하나도 안 나와요
A: 
1. 후보자 이름 철자 확인
2. 키워드를 더 넓게: "충북도지사" 만
3. 날짜 범위 확인

### Q: 구글 알림 RSS는 어떻게 복사하나요?
A:
1. 알림 목록에서 RSS 아이콘 찾기
2. 우클릭 → "링크 주소 복사"
3. 코드에 붙여넣기

---

## 최종 확인

모든 설정 후 테스트:

```bash
cd C:\Users\MyPC\Desktop\충북도지사
set ANTHROPIC_API_KEY=your-key
python local_news_crawler.py
```

성공하면:
```
============================================================
충북 지역 언론사 RSS 수집 시작
============================================================

【구글알림】
  수집 중: 구글알림 - https://www.google.com/alerts/feeds/xxxxx
    ✅ 15개 관련 기사 발견

✅ 총 15개 관련 기사 수집 완료!
✅ 저장 완료: relationships_raw.csv
✅ 총 23개 관계 추출
```
