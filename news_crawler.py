"""
충북 도지사 후보 관계망 분석 - 뉴스 크롤링 및 관계 추출
Phase 1: 데이터 수집 자동화 시스템
"""

import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
from datetime import datetime, timedelta
import time
import re
from anthropic import Anthropic
import os

# Claude API 설정
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 후보자 데이터 로드
with open('candidates_data.json', 'r', encoding='utf-8') as f:
    candidates_data = json.load(f)

CANDIDATES = [c['name'] for c in candidates_data['candidates']]

class NewsRelationshipExtractor:
    """뉴스 기사에서 후보자 간 관계를 자동 추출하는 클래스"""
    
    def __init__(self):
        self.candidates = CANDIDATES
        self.relationships = []
        
    def crawl_naver_news(self, keyword, days=30, max_articles=50):
        """
        네이버 뉴스 검색 결과 크롤링
        
        Args:
            keyword: 검색 키워드
            days: 최근 며칠 간의 뉴스
            max_articles: 최대 수집 기사 수
        
        Returns:
            list: 뉴스 기사 리스트
        """
        articles = []
        
        # 날짜 범위 설정
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 네이버 뉴스 검색 URL
        base_url = "https://search.naver.com/search.naver"
        
        for page in range(1, min(max_articles//10, 10) + 1):
            params = {
                'where': 'news',
                'query': keyword,
                'start': (page - 1) * 10 + 1,
                'sort': 0,
                'pd': 3,
                'ds': start_date.strftime('%Y.%m.%d'),
                'de': end_date.strftime('%Y.%m.%d')
            }
            
            try:
                response = requests.get(base_url, params=params, 
                                      headers={'User-Agent': 'Mozilla/5.0'})
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 뉴스 항목 파싱
                news_items = soup.select('.news_area')
                
                for item in news_items:
                    title_elem = item.select_one('.news_tit')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    url = title_elem['href']
                    
                    # 요약문 추출
                    content_elem = item.select_one('.news_dsc')
                    content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # 날짜 추출
                    date_elem = item.select_one('.info_group .info')
                    date_str = date_elem.get_text(strip=True) if date_elem else ""
                    
                    articles.append({
                        'title': title,
                        'content': content,
                        'url': url,
                        'date': date_str,
                        'keyword': keyword
                    })
                
                time.sleep(1)
                
            except Exception as e:
                print(f"크롤링 오류 (keyword: {keyword}, page: {page}): {e}")
                continue
                
        return articles[:max_articles]
    
    def extract_relationships_with_claude(self, article):
        """
        Claude API를 사용해 기사에서 후보자 간 관계 추출
        
        Args:
            article: 뉴스 기사 딕셔너리
            
        Returns:
            list: 관계 데이터 리스트
        """
        # 후보자 이름이 포함된 기사만 처리
        mentioned_candidates = [c for c in self.candidates if c in article['title'] + article['content']]
        
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
5. strength는 관계의 명확성과 중요도 (0=희미함, 1=매우명확)
"""
        
        try:
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            response_text = message.content[0].text
            
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', 
                                  response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            
            result = json.loads(response_text)
            
            for rel in result.get('relationships', []):
                rel['source_article'] = article['title']
                rel['url'] = article['url']
                rel['date'] = article['date']
                rel['keyword'] = article['keyword']
            
            return result.get('relationships', [])
            
        except Exception as e:
            print(f"Claude API 오류: {e}")
            return []
    
    def collect_all_relationships(self, search_keywords=None, days=30):
        """
        모든 후보자 관련 뉴스를 수집하고 관계 추출
        
        Args:
            search_keywords: 검색 키워드 리스트
            days: 최근 며칠
            
        Returns:
            DataFrame: 관계 데이터프레임
        """
        if search_keywords is None:
            search_keywords = [f"{name} 충북도지사" for name in self.candidates]
            search_keywords.extend([
                "충북도지사 선거",
                "충북도지사 후보",
                "2026 충북지사"
            ])
        
        all_relationships = []
        
        for keyword in search_keywords:
            print(f"\n검색 중: {keyword}")
            articles = self.crawl_naver_news(keyword, days=days, max_articles=30)
            print(f"  → {len(articles)}개 기사 수집")
            
            for i, article in enumerate(articles, 1):
                if i % 10 == 0:
                    print(f"  → 분석 진행: {i}/{len(articles)}")
                
                relationships = self.extract_relationships_with_claude(article)
                all_relationships.extend(relationships)
                
                time.sleep(0.5)
        
        df = pd.DataFrame(all_relationships)
        
        if len(df) > 0:
            df = df.drop_duplicates(subset=['person1', 'person2', 'relation_type'], 
                                   keep='first')
        
        return df
    
    def save_to_csv(self, df, filename='relationships.csv'):
        """관계 데이터 CSV 저장"""
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"\n저장 완료: {filename}")
        print(f"총 {len(df)}개 관계 추출")


def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("충청북도 도지사 후보 관계망 분석 - Phase 1")
    print("뉴스 기반 자동 데이터 수집 시스템")
    print("=" * 60)
    
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("\n⚠️  ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")
        print("명령 프롬프트에서 다음 명령어를 실행하세요:")
        print("set ANTHROPIC_API_KEY=your-api-key")
        return
    
    extractor = NewsRelationshipExtractor()
    
    df_relationships = extractor.collect_all_relationships(days=30)
    
    extractor.save_to_csv(df_relationships, 'relationships_raw.csv')
    
    if len(df_relationships) > 0:
        print("\n" + "=" * 60)
        print("수집 결과 요약")
        print("=" * 60)
        print(f"\n총 관계 수: {len(df_relationships)}")
        print(f"\n관계 유형 분포:")
        print(df_relationships['relation_type'].value_counts())
        print(f"\n인물별 언급 빈도:")
        persons = pd.concat([df_relationships['person1'], 
                            df_relationships['person2']])
        print(persons.value_counts().head(10))
    
    return df_relationships


if __name__ == "__main__":
    df = main()
