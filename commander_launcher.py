import tkinter as tk
from tkinter import ttk, messagebox
import threading
import subprocess
import os
import sys

# 메인 오케스트레이터 경로 설정
ORCHESTRATOR_PATH = "main_orchestrator.py"

class TacticalLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("2026 충북지사 전략 지휘본부 (Command Center v2.1)")
        self.root.geometry("500x380")
        self.root.configure(bg="#0a0a0b")
        self.root.resizable(False, False)

        # 스타일 설정 (Progressbar)
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Tactical.Horizontal.TProgressbar", 
                        troughcolor='#1a1a1b', 
                        background='#0066CC', 
                        darkcolor='#0066CC', 
                        lightcolor='#0066CC',
                        bordercolor='#1a1a1b')
        
        # 메인 레이아웃
        self.header = tk.Label(root, text="CHUNGBUK STRATEGY COMMAND", bg="#0a0a0b", fg="#0066CC", font=("Arial", 16, "bold"))
        self.header.pack(pady=20)

        self.status_label = tk.Label(root, text="[대기 중] 지휘관의 명령을 기다리고 있습니다.", bg="#0a0a0b", fg="#888", font=("Malgun Gothic", 10))
        self.status_label.pack(pady=5)

        # 중앙 버튼 (동기화 버튼)
        self.deploy_btn = tk.Button(
            root, text="SYNC & DEPLOY\n\n(실시간 분석 및 클라우드 배포 시작)", 
            command=self.start_sync,
            bg="#0066CC", fg="white", font=("Malgun Gothic", 11, "bold"),
            padx=20, pady=15, borderwidth=0, activebackground="#004C99", activeforeground="white",
            cursor="hand2", relief="flat"
        )
        self.deploy_btn.pack(pady=25)

        # 프로그레스 바
        self.progress = ttk.Progressbar(root, length=400, mode='determinate', style="Tactical.Horizontal.TProgressbar")
        self.progress.pack(pady=10)

        self.info_frame = tk.Frame(root, bg="#0a0a0b")
        self.info_frame.pack(side="bottom", fill="x", pady=20)

        self.footer = tk.Label(self.info_frame, text="CLOUD DASHBOARD: https://election-umber.vercel.app/", 
                              bg="#0a0a0b", fg="#444", font=("Arial", 8))
        self.footer.pack()
        
        self.log_label = tk.Label(self.info_frame, text="Ready.", bg="#0a0a0b", fg="#333", font=("Arial", 7))
        self.log_label.pack()

    def start_sync(self):
        # API 키 체크
        if not os.environ.get("ANTHROPIC_API_KEY"):
            messagebox.showwarning("경고", "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.\n일부 AI 리포트 기능이 제한될 수 있습니다.")
            
        self.deploy_btn.config(state="disabled", text="ANALYZING...\n\n(작전 수행 중)", bg="#222")
        self.progress['value'] = 0
        threading.Thread(target=self.run_process, daemon=True).start()

    def run_process(self):
        try:
            # main_orchestrator.py 실행 가상 환경이 아닌 현재 Python으로 실행
            # -u 옵션으로 실시간 스트리밍
            process = subprocess.Popen([sys.executable, "-u", ORCHESTRATOR_PATH], 
                                     stdout=subprocess.PIPE, 
                                     stderr=subprocess.STDOUT, 
                                     text=True, 
                                     shell=True,
                                     encoding='utf-8',
                                     errors='replace')
            
            # 실시간 로그 및 상태 업데이트
            while True:
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    msg = output.strip()
                    if not msg: continue
                    
                    self.log_label.config(text=msg[:60]) # 하단 한 줄 로그 업데이트
                    
                    # 진행률 트리거 (main_orchestrator의 [X/7] 형식을 감지)
                    if "[" in msg and "/" in msg and "]" in msg:
                        try:
                            step_info = msg.split("]")[0].replace("[", "").split("/")
                            current_step = int(step_info[0])
                            total_steps = int(step_info[1])
                            self.progress['value'] = (current_step / total_steps) * 100
                            self.status_label.config(text=f"[작전 수행] {msg.split(']')[1].strip()}", fg="#00CC66")
                        except:
                            pass
            
            if process.returncode == 0:
                self.progress['value'] = 100
                self.status_label.config(text="✅ 작전 완료: 클라우드 동기화 성공", fg="#00CC66")
                self.root.after(0, lambda: messagebox.showinfo("완료", "모든 데이터 분석 및 배포가 완료되었습니다.\n대시보드에서 확인하세요."))
            else:
                self.status_label.config(text="❌ 작전 실패: 빌드 오류 발생", fg="#FF3333")
                self.root.after(0, lambda: messagebox.showerror("오류", "분석 과정 중 오류가 발생했습니다.\n터미널에서 상세 소스코드를 확인하세요."))

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("실행 오류", f"Launcher 시스템 오류: {str(e)}"))
        finally:
            self.deploy_btn.config(state="normal", text="SYNC & DEPLOY\n\n(실시간 분석 및 클라우드 배포 시작)", bg="#0066CC")

if __name__ == "__main__":
    root = tk.Tk()
    app = TacticalLauncher(root)
    root.mainloop()
