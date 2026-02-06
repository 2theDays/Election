"""
간단한 테스트 프로그램
API 키가 제대로 작동하는지 확인합니다
"""

import os
from anthropic import Anthropic

print("=" * 60)
print("Claude API 연결 테스트")
print("=" * 60)

# API 키 확인
api_key = os.environ.get("ANTHROPIC_API_KEY")

if not api_key:
    print("\n❌ API 키가 설정되지 않았습니다!")
    print("\n다음 명령어를 실행하세요:")
    print("set ANTHROPIC_API_KEY=여기에_실제_키_입력")
else:
    print(f"\n✅ API 키 확인: {api_key[:10]}...{api_key[-5:]}")
    
    try:
        # Claude에게 간단한 질문
        client = Anthropic(api_key=api_key)
        
        print("\n🤖 Claude에게 질문 중...")
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": "안녕하세요! 간단히 인사해주세요."
            }]
        )
        
        response = message.content[0].text
        
        print(f"\n✅ Claude 응답: {response}")
        print("\n🎉 API 연결 성공! 본 프로그램 실행 가능합니다.")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        print("\nAPI 키를 다시 확인해주세요.")

input("\n아무 키나 눌러 종료...")
