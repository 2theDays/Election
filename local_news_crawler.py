"""
충북 지역 신문사 RSS 기반 뉴스 수집기
네이버 차단 우회 - 지역 언론사 + 구글 알림 활용
"""

import feedparser
import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
from datetime import datetime
import time
import google.generativeai as genai
import os
import re

# .env 로드 함수
def load_env():
    try:
        with open('.env', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value.strip()
    except: pass

load_env()

# Gemini API 설정
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# ============================================================================
# 1. 충북 지역 신문사 RSS 주소 목록
# ============================================================================

REGIONAL_NEWS_SOURCES = {
    # === 주요 일간지 ===
    "충북일보": {
        "rss": [
            "https://www.inews365.com/rss/allArticle.xml",
            "https://www.inews365.com/rss/S1N1.xml",  # 정치
            "https://www.inews365.com/news/rss.xml",
        ],
        "search_url": "https://www.inews365.com",
        "type": "일간지"
    },
    "충청일보": {
        "rss": [
            "https://www.ccdailynews.com/rss/allArticle.xml",
            "https://www.ccdailynews.com/rss/S1N1.xml",
        ],
        "search_url": "https://www.ccdailynews.com",
        "type": "일간지"
    },
    "중부매일": {
        "rss": [
            "https://www.jbnews.com/rss/allArticle.xml",
            "https://www.jbnews.com/rss/S1N1.xml",
        ],
        "search_url": "https://www.jbnews.com",
        "type": "일간지"
    },
    "동양일보": {
        "rss": [
            "http://www.dynews.co.kr/rss/allArticle.xml",
            "http://www.dynews.co.kr/news/rss.xml",
        ],
        "search_url": "http://www.dynews.co.kr",
        "type": "일간지"
    },
    "충청타임즈": {
        "rss": [
            "http://www.cctimes.kr/rss/allArticle.xml",
            "http://www.cctimes.kr/news/rss.xml",
        ],
        "search_url": "http://www.cctimes.kr",
        "type": "일간지"
    },
    "충청투데이": {
        "rss": [
            "http://www.cctoday.co.kr/rss/allArticle.xml",
            "http://www.cctoday.co.kr/news/rss.xml",
        ],
        "search_url": "http://www.cctoday.co.kr",
        "type": "일간지"
    },
    
    # === 인터넷 신문 ===
    "굿모닝충청": {
        "rss": [
            "https://www.goodmorningcc.com/rss/allArticle.xml",
            "https://www.goodmorningcc.com/news/rss.xml",
        ],
        "search_url": "https://www.goodmorningcc.com",
        "type": "인터넷신문"
    },
    "충북인뉴스": {
        "rss": [
            "https://www.cbinews.co.kr/rss/allArticle.xml",
        ],
        "search_url": "https://www.cbinews.co.kr",
        "type": "인터넷신문"
    },
    
    # === 주간지 ===
    "옥천신문": {
        "rss": [
            "http://www.okinews.com/rss/allArticle.xml",
        ],
        "search_url": "http://www.okinews.com",
        "type": "주간지"
    },
}

# 구글 알림 RSS (충북 도지사 관련 키워드)
# 사용자가 직접 만들어야 함: https://www.google.com/alerts
GOOGLE_ALERTS_RSS = [
    # 예시 - 실제 RSS 주소로 교체하세요:
    # "https://www.google.com/alerts/feeds/12345678901234567890/신용한충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/노영민충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/송기섭충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/한범덕충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/윤희근충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/이종배충북도지사",
    # "https://www.google.com/alerts/feeds/12345678901234567890/충북도지사선거",
    # "https://www.google.com/alerts/feeds/12345678901234567890/2026충북도지사",
]

# ============================================================================
# 2. RSS 피드 파서
# ============================================================================

class LocalNewsCollector:
    """지역 신문사 RSS 수집기"""
    
    def __init__(self):
        self.articles = []
        # 후보자 데이터 로드
        with open('candidates_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.candidates = [c['name'] for c in data['candidates']]
        self.working_rss_urls = []  # 작동하는 RSS 주소 저장
    
    def test_rss_url(self, url):
        """RSS URL이 작동하는지 테스트"""
        try:
            feed = feedparser.parse(url)
            if feed.entries and len(feed.entries) > 0:
                return True
            return False
        except:
            return False
    
    def find_working_rss(self, base_url, source_name):
        """여러 RSS 패턴을 시도해서 작동하는 것 찾기"""
        patterns = [
            "/rss/allArticle.xml",
            "/rss/S1N1.xml",
            "/news/rss.xml",
            "/rss.xml",
            "/feed",
            "/rss",
            "/rss/news.xml",
        ]
        
        working_urls = []
        
        for pattern in patterns:
            test_url = base_url.rstrip('/') + pattern
            if self.test_rss_url(test_url):
                working_urls.append(test_url)
                print(f"    ✅ 발견: {test_url}")
        
        return working_urls
    
    def collect_from_rss(self, rss_url, source_name):
        """RSS 피드에서 기사 수집"""
        try:
            print(f"  시도 중: {rss_url}")
            
            # RSS 파싱
            feed = feedparser.parse(rss_url)
            
            if not feed.entries:
                print(f"    ⚠️  피드가 비어있음 또는 주소 오류")
                return []
            
            # 작동하는 URL 저장
            if rss_url not in self.working_rss_urls:
                self.working_rss_urls.append(rss_url)
            
            articles_found = []
            
            for entry in feed.entries:
                # 기본 정보 추출
                title = entry.get('title', '')
                link = entry.get('link', '')
                summary = entry.get('summary', entry.get('description', ''))
                published = entry.get('published', entry.get('updated', ''))
                
                # 후보자 이름이 포함된 기사만 수집
                full_text = title + " " + summary
                if any(name in full_text for name in self.candidates):
                    articles_found.append({
                        'title': title,
                        'content': BeautifulSoup(summary, 'html.parser').get_text(),
                        'url': link,
                        'date': published,
                        'source': source_name,
                        'keyword': '후보자명'
                    })
            
            print(f"    ✅ {len(articles_found)}개 관련 기사 발견 (전체 {len(feed.entries)}개)")
            return articles_found
            
        except Exception as e:
            print(f"    ❌ 오류: {e}")
            return []
    
    def collect_all(self):
        """모든 소스에서 수집"""
        print("\n" + "="*60)
        print("충북 지역 언론사 RSS 수집 시작")
        print("="*60 + "\n")
        
        all_articles = []
        
        # 1. 지역 신문사 RSS
        for source_name, source_info in REGIONAL_NEWS_SOURCES.items():
            print(f"\n【{source_name}】 ({source_info.get('type', '언론사')})")
            
            # 먼저 제공된 RSS 주소 시도
            found_articles = False
            for rss_url in source_info['rss']:
                articles = self.collect_from_rss(rss_url, source_name)
                if articles:
                    all_articles.extend(articles)
                    found_articles = True
                time.sleep(0.5)
            
            # RSS가 안 되면 자동 탐지 시도
            if not found_articles:
                print(f"  💡 자동 탐지 모드...")
                working_urls = self.find_working_rss(
                    source_info['search_url'], 
                    source_name
                )
                
                for url in working_urls:
                    articles = self.collect_from_rss(url, source_name)
                    all_articles.extend(articles)
                    time.sleep(0.5)
        
        # 2. 구글 알림 RSS (있는 경우)
        if GOOGLE_ALERTS_RSS:
            print(f"\n【구글 알림】")
            for rss_url in GOOGLE_ALERTS_RSS:
                if rss_url.startswith("http"):  # 주석이 아닌 실제 URL만
                    articles = self.collect_from_rss(rss_url, "구글알림")
                    all_articles.extend(articles)
                    time.sleep(0.5)
        
        # 3. 작동하는 RSS 주소 출력
        if self.working_rss_urls:
            print(f"\n" + "="*60)
            print("✅ 작동 확인된 RSS 주소")
            print("="*60)
            for url in self.working_rss_urls:
                print(f"  {url}")
            print("\n💡 다음번엔 이 주소들만 사용하면 더 빠릅니다!")
        
        return all_articles
    
    def extract_relationships_with_claude(self, article):
        """Claude API로 관계 추출"""
        mentioned_candidates = [c for c in self.candidates 
                               if c in article['title'] + article['content']]
        
        if len(mentioned_candidates) < 1:
            return []
        
        prompt = f"""
다음 뉴스 기사를 분석하여 충청북도 도지사 후보자들 간의 관계를 추출하세요.

**후보자 명단**: {', '.join(self.candidates)}

**기사 제목**: {article['title']}

**기사 내용**: {article['content']}

**출력 형식 (JSON)**:
{{
    "relationships": [
        {{
            "person1": "후보자명",
            "person2": "후보자명 또는 관련 인물",
            "relation_type": "정치적동맹|경쟁|학연|지연|사제|협력|비판|지지|중립",
            "strength": 0.0-1.0,
            "direction": "양방향|person1→person2|person2→person1",
            "evidence": "관계를 보여주는 기사 속 핵심 문장",
            "sentiment": "긍정|부정|중립"
        }}
    ]
}}

**규칙**:
1. 후보자 명단에 있는 인물만 추출
2. 기사에 명시적으로 나타난 관계만 추출
3. 추측이나 추론 금지
4. 관계가 없으면 빈 리스트 반환
"""
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            
            response_text = response.text
            
            # JSON 추출
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', 
                                  response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            
            result = json.loads(response_text)
            
            # 메타데이터 추가
            for rel in result.get('relationships', []):
                rel['source_article'] = article['title']
                rel['url'] = article['url']
                rel['date'] = article['date']
                rel['keyword'] = article['source']
            
            return result.get('relationships', [])
            
        except Exception as e:
            print(f"    Gemini API 오류: {e}")
            return []
    
    def process_articles(self, articles):
        """기사 목록 처리 및 관계 추출"""
        print(f"\n{'='*60}")
        print(f"Claude API로 관계 추출 시작 ({len(articles)}개 기사)")
        print("="*60 + "\n")
        
        all_relationships = []
        
        for i, article in enumerate(articles, 1):
            if i % 5 == 0:
                print(f"진행: {i}/{len(articles)}")
            
            relationships = self.extract_relationships_with_claude(article)
            all_relationships.extend(relationships)
            
            time.sleep(0.5)  # API 과부하 방지
        
        return pd.DataFrame(all_relationships)


# ============================================================================
# 3. 실행
# ============================================================================

def main():
    print("\n" + "="*60)
    print("충북 도지사 후보 관계망 분석")
    print("지역 신문사 RSS 기반 데이터 수집")
    print(f"대상 언론사: {len(REGIONAL_NEWS_SOURCES)}개")
    print("="*60)
    
    # API 키 확인
    if not os.environ.get("GEMINI_API_KEY"):
        print("\n⚠️  GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        print("명령 프롬프트에서:")
        print("  set GEMINI_API_KEY=your-api-key")
        return
    
    # 수집기 생성
    collector = LocalNewsCollector()
    
    # 1. RSS에서 기사 수집
    articles = collector.collect_all()
    
    if not articles:
        print("\n" + "="*60)
        print("⚠️  수집된 기사가 없습니다")
        print("="*60)
        print("\n💡 해결 방법:")
        print("1. 구글 알림 RSS 사용 (가장 확실!)")
        print("   - https://www.google.com/alerts")
        print("   - 각 후보자명으로 알림 생성")
        print("   - RSS 주소 복사해서 코드에 입력")
        print("\n2. RSS 주소 직접 확인:")
        print("   - 신문사 웹사이트 방문")
        print("   - 페이지 소스 보기 (우클릭)")
        print("   - 'rss' 또는 'feed' 검색")
        print("\n3. 크롬 확장 프로그램 사용:")
        print("   - 'Get RSS Feed URL' 설치")
        print("   - 신문사 사이트에서 클릭")
        return
    
    print(f"\n" + "="*60)
    print(f"✅ 총 {len(articles)}개 관련 기사 수집 완료!")
    print("="*60)
    
    # 언론사별 통계
    source_counts = {}
    for article in articles:
        source = article['source']
        source_counts[source] = source_counts.get(source, 0) + 1
    
    print("\n언론사별 기사 수:")
    for source, count in sorted(source_counts.items(), 
                                key=lambda x: x[1], reverse=True):
        print(f"  {source}: {count}개")
    
    # 2. Claude API로 관계 추출
    df_relationships = collector.process_articles(articles)
    
    if len(df_relationships) == 0:
        print("\n⚠️  추출된 관계가 없습니다.")
        print("💡 기사는 있지만 후보자 간 관계가 명확하지 않을 수 있습니다.")
        return
    
    # 3. CSV + Excel 저장
    df_relationships.to_csv('relationships_raw.csv', 
                           index=False, 
                           encoding='utf-8-sig')
    print(f"\n✅ CSV 저장: relationships_raw.csv")
    
    # Excel도 저장 (한글 안 깨짐)
    try:
        import openpyxl
        df_relationships.to_excel('relationships_raw.xlsx', 
                                 index=False, 
                                 engine='openpyxl')
        print(f"✅ Excel 저장: relationships_raw.xlsx")
    except:
        print("💡 Excel 파일을 만들려면: pip install openpyxl")
    
    print(f"\n총 {len(df_relationships)}개 관계 추출")
    
    # 4. 요약 통계
    print("\n" + "="*60)
    print("📊 수집 결과 요약")
    print("="*60)
    
    print(f"\n관계 유형 분포:")
    rel_counts = df_relationships['relation_type'].value_counts()
    for rel_type, count in rel_counts.items():
        print(f"  {rel_type}: {count}개")
    
    print(f"\n언론사별 관계 추출:")
    keyword_counts = df_relationships['keyword'].value_counts()
    for keyword, count in keyword_counts.items():
        print(f"  {keyword}: {count}개")
    
    print(f"\n💡 다음 단계:")
    print("  python network_analysis_premium.R 실행")
    print("  → 네트워크 분석 및 시각화")


if __name__ == "__main__":
    main()
