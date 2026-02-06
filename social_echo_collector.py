"""
충북 도지사 후보 '에코 체임버(Echo Chamber)' 및 커뮤니티 민심 분석기
Phase 2: 온라인 커뮤니티, 카페, 블로그의 반응 및 프레임 분석
"""

import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
from datetime import datetime
import time
import re
from anthropic import Anthropic
import os

# Claude API 설정
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class SocialEchoCollector:
    """커뮤니티 및 소셜 미디어의 '에코 체임버' 효과와 여론 프레임을 분석하는 클래스"""
    
    def __init__(self):
        with open('candidates_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.candidates = [c['name'] for c in data['candidates']]
        self.echo_data = []

    def collect_naver_community(self, keyword, search_type='cafe', max_pages=3):
        """네이버 카페 또는 블로그에서 커뮤니티 반응 수집 (실질적 에코 체임버)"""
        results = []
        base_url = f"https://search.naver.com/search.naver?where={search_type}&query={keyword}"
        
        print(f"  > 네이버 {search_type} 검색 중: {keyword}")
        
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(base_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 검색 결과 항목 추출 (카페/블로그 패턴에 따라 조정 필요)
            items = soup.select('.api_ani_send') # 네이버 검색 결과 공통 클래스 시도
            if not items:
                items = soup.select('.total_wrap') # 대안 패턴
                
            for item in items[:20]: # 페이지당 상위 20개
                title = item.select_one('.api_txt_lines.total_tit')
                desc = item.select_one('.api_txt_lines.dsc_txt')
                
                if title and desc:
                    results.append({
                        'title': title.get_text(strip=True),
                        'snippet': desc.get_text(strip=True),
                        'source_type': search_type,
                        'keyword': keyword
                    })
            
            return results
        except Exception as e:
            print(f"    ❌ 수집 오류: {e}")
            return []

    def analyze_echo_frames(self, candidate_name, raw_data):
        """수집된 커뮤니티 반응에서 주된 '프레임'과 '에코' 강도 분석"""
        if not raw_data:
            return None
            
        combined_text = "\n".join([f"- {d['title']}: {d['snippet']}" for d in raw_data])
        
        prompt = f"""
다음은 충북도지사 후보 '{candidate_name}'에 대한 온라인 커뮤니티(카페, 블로그 등)의 반응들입니다. 
이 데이터에서 나타나는 '에코 체임버(반복되는 여론의 틀)'를 분석하세요.

**수집 데이터**:
{combined_text}

**분석 요청 사항 (JSON 형식으로 답하세요)**:
{{
    "candidate": "{candidate_name}",
    "top_frames": [
        {{
            "frame_name": "프레임 명칭 (예: '행정전문가', '배신자 프레임' 등)",
            "sentiment": "긍정|부정|중립",
            "echo_strength": 0.0-1.0 (얼마나 많이 반복되는가),
            "key_arguments": ["주된 논거 1", "주된 논거 2"]
        }}
    ],
    "polarization_index": 0.0-1.0 (여론이 얼마나 양극화되어 있는가),
    "viral_potential": "높음|중간|낮음",
    "summary": "전반적인 민심 요약"
}}

**주의**: 
1. 실제 데이터에 기반하여 분석하세요. 
2. 정치적 중립을 유지하세요.
"""

        try:
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            
            return json.loads(response_text)
        except Exception as e:
            print(f"    ❌ 분석 오류: {e}")
            return None

    def run_analysis(self):
        print("\n" + "="*60)
        print("🚀 Step 2: 에코 체임버 및 커뮤니티 프레임 분석 시작")
        print("="*60)
        
        final_reports = []
        
        for name in self.candidates:
            print(f"\n【{name} 후보 분석】")
            
            # 1. 데이터 수집 (카페 + 블로그)
            cafe_data = self.collect_naver_community(f"{name} 충북도지사", 'cafe')
            blog_data = self.collect_naver_community(f"{name} 충북도지사", 'blog')
            total_data = cafe_data + blog_data
            
            if not total_data:
                print(f"  ⚠️ 수집된 커뮤니티 반응이 없습니다.")
                continue
                
            print(f"  ✅ {len(total_data)}개의 반응 수집 완료. 프레임 분석 중...")
            
            # 2. 프레임 분석
            report = self.analyze_echo_frames(name, total_data)
            if report:
                final_reports.append(report)
                print(f"  📊 주요 프레임: {report['top_frames'][0]['frame_name']} ({report['top_frames'][0]['sentiment']})")
                print(f"  📈 양극화 지수: {report['polarization_index']}")
            
            time.sleep(1) # API 부하 방지
            
        # 3. 결과 저장
        if final_reports:
            output_file = 'community_sentiment_analysis.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(final_reports, f, ensure_ascii=False, indent=4)
            print(f"\n✅ 분석 완료! 결과 저장: {output_file}")
            
            # CSV로 요약본 생성
            summary_list = []
            for r in final_reports:
                for f in r['top_frames']:
                    summary_list.append({
                        'candidate': r['candidate'],
                        'frame': f['frame_name'],
                        'sentiment': f['sentiment'],
                        'strength': f['echo_strength'],
                        'polarization': r['polarization_index']
                    })
            pd.DataFrame(summary_list).to_csv('community_sentiment_summary.csv', index=False, encoding='utf-8-sig')
            print(f"✅ 요약 CSV 저장: community_sentiment_summary.csv")

if __name__ == "__main__":
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("⚠️ ANTHROPIC_API_KEY 환경변수가 필요합니다.")
    else:
        analyzer = SocialEchoCollector()
        analyzer.run_analysis()
