from datetime import datetime
import google.generativeai as genai

print("Import google.generativeai successful")

def load_env():
    import os
    try:
        if os.path.exists('.env'):
            print(".env Found")
            api_key = ''
            with open('.env', encoding='utf-8') as f:
                for line in f:
                    if 'GEMINI_API_KEY=' in line:
                         api_key = line.split('=')[1].strip()
                         print(f"API Key Found: {api_key[:10]}...")
                         genai.configure(api_key=api_key)
        else:
            print(".env Missing")

    except Exception as e:
        print(f"Error loading .env: {e}")

load_env()

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    resp = model.generate_content("Hello Gemini!")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"GenAI Error: {e}")
