# ============================================================================
# 2026 충청북도 도지사 선거 예측 시뮬레이션
# 365일 지지율 변화 + 시나리오 분석
# ============================================================================

cat("\n")
cat("============================================================\n")
cat("충청북도 도지사 선거 시뮬레이션\n")
cat("Phase 3: 시스템 다이내믹스 예측 모델\n")
cat("============================================================\n\n")

# ============================================================================
# 1. 패키지 로딩
# ============================================================================

cat("패키지 로딩 중...\n")

suppressPackageStartupMessages({
  library(deSolve)
})

cat("✅ 패키지 로딩 완료!\n\n")

# ============================================================================
# 2. 네트워크 분석 결과 로드
# ============================================================================

cat("네트워크 분석 결과 로딩 중...\n")

centrality <- read.csv("centrality_scores.csv", fileEncoding = "UTF-8")

# 주요 후보 4명 데이터 추출
candidates <- centrality[centrality$정당 != "기타", ]
candidates <- candidates[order(-candidates$종합점수), ]

# 상위 4명만 시뮬레이션 (간단하게)
top4 <- head(candidates, 4)

cat(sprintf("✅ 후보 %d명 데이터 로드\n", nrow(top4)))
cat("\n시뮬레이션 대상:\n")
print(top4[, c("후보자", "정당", "여론지지율", "종합점수")])
cat("\n")

# ============================================================================
# 3. 시뮬레이션 모델 정의
# ============================================================================

cat("시뮬레이션 모델 구축 중...\n")

# 미분방정식 시스템
election_model <- function(t, state, parms) {
  with(as.list(c(state, parms)), {
    
    # 현재 지지층
    S1 <- state[1]  # 1위 후보
    S2 <- state[2]  # 2위 후보
    S3 <- state[3]  # 3위 후보
    S4 <- state[4]  # 4위 후보
    U <- state[5]   # 무당층
    
    # === 네트워크 영향력 (시간에 따라 증가) ===
    network_effect1 <- network1 * (1 + t/365 * 0.15)
    network_effect2 <- network2 * (1 + t/365 * 0.12)
    network_effect3 <- network3 * (1 + t/365 * 0.08)
    network_effect4 <- network4 * (1 + t/365 * 0.05)
    
    # === SNS/언론 효과 (주기적 변동) ===
    media_effect1 <- 0.6 + 0.1 * sin(t/60)
    media_effect2 <- 0.5 + 0.08 * sin(t/50)
    media_effect3 <- 0.4 + 0.06 * sin(t/40)
    media_effect4 <- 0.35 + 0.05 * sin(t/30)
    
    # === 스캔들 효과 ===
    scandal_impact <- 0
    if(t >= scandal_day && t <= scandal_day + scandal_duration) {
      scandal_impact <- scandal_intensity * exp(-(t - scandal_day)/20)
    }
    
    # === 단일화 효과 ===
    unity_boost <- 0
    if(t >= unity_day) {
      unity_boost <- unity_effect
    }
    
    # === 유입률 (무당층 → 지지층) ===
    inflow1 <- U * (network_effect1 * 0.4 + media_effect1 * 0.3 + 
                    poll1/100 * 0.3) * 0.015
    inflow2 <- U * (network_effect2 * 0.4 + media_effect2 * 0.3 + 
                    poll2/100 * 0.3 + unity_boost) * 0.012
    inflow3 <- U * (network_effect3 * 0.4 + media_effect3 * 0.3 + 
                    poll3/100 * 0.3) * 0.010
    inflow4 <- U * (network_effect4 * 0.4 + media_effect4 * 0.3 + 
                    poll4/100 * 0.3) * 0.008
    
    # === 이탈률 (지지층 → 무당층/포기층) ===
    outflow1 <- S1 * (0.002 + scandal_impact * (1 - network_effect1))
    outflow2 <- S2 * 0.003
    outflow3 <- S3 * 0.004
    outflow4 <- S4 * 0.005
    
    # === 변화율 (미분방정식) ===
    dS1 <- inflow1 - outflow1
    dS2 <- inflow2 - outflow2
    dS3 <- inflow3 - outflow3
    dS4 <- inflow4 - outflow4
    dU <- -inflow1 - inflow2 - inflow3 - inflow4 + 
          outflow1 + outflow2 + outflow3 + outflow4
    
    return(list(c(dS1, dS2, dS3, dS4, dU)))
  })
}

cat("✅ 모델 구축 완료!\n\n")

# ============================================================================
# 4. 시나리오 설정
# ============================================================================

cat("========== 시나리오 설정 ==========\n\n")

# 초기값 (현재 지지율)
initial_state <- c(
  S1 = top4$여론지지율[1],
  S2 = top4$여론지지율[2],
  S3 = top4$여론지지율[3],
  S4 = top4$여론지지율[4],
  U = 100 - sum(top4$여론지지율[1:4])
)

cat("초기 지지율:\n")
cat(sprintf("  %s: %.1f%%\n", top4$후보자[1], initial_state[1]))
cat(sprintf("  %s: %.1f%%\n", top4$후보자[2], initial_state[2]))
cat(sprintf("  %s: %.1f%%\n", top4$후보자[3], initial_state[3]))
cat(sprintf("  %s: %.1f%%\n", top4$후보자[4], initial_state[4]))
cat(sprintf("  무당층: %.1f%%\n\n", initial_state[5]))

# 시뮬레이션 기간 (365일 = 1년)
times <- seq(0, 365, by = 1)

# ============================================================================
# 5. 시나리오 1: 기본 시나리오 (현상 유지)
# ============================================================================

cat("【시나리오 1】 기본 - 큰 변수 없음\n")

params_baseline <- list(
  network1 = top4$종합점수[1],
  network2 = top4$종합점수[2],
  network3 = top4$종합점수[3],
  network4 = top4$종합점수[4],
  poll1 = top4$여론지지율[1],
  poll2 = top4$여론지지율[2],
  poll3 = top4$여론지지율[3],
  poll4 = top4$여론지지율[4],
  scandal_day = 999,      # 스캔들 없음
  scandal_intensity = 0,
  scandal_duration = 0,
  unity_day = 999,        # 단일화 없음
  unity_effect = 0
)

out_baseline <- ode(y = initial_state, times = times, 
                   func = election_model, parms = params_baseline)

cat("✅ 시뮬레이션 완료\n\n")

# ============================================================================
# 6. 시나리오 2: 1위 후보 스캔들
# ============================================================================

cat("【시나리오 2】 스캔들 - 180일차에 1위 후보 스캔들 발생\n")

params_scandal <- params_baseline
params_scandal$scandal_day <- 180
params_scandal$scandal_intensity <- 0.4
params_scandal$scandal_duration <- 45

out_scandal <- ode(y = initial_state, times = times,
                  func = election_model, parms = params_scandal)

cat("✅ 시뮬레이션 완료\n\n")

# ============================================================================
# 7. 시나리오 3: 야권 단일화
# ============================================================================

cat("【시나리오 3】 단일화 - 270일차에 2-3위 후보 단일화\n")

params_unity <- params_baseline
params_unity$unity_day <- 270
params_unity$unity_effect <- 0.25

out_unity <- ode(y = initial_state, times = times,
                func = election_model, parms = params_unity)

cat("✅ 시뮬레이션 완료\n\n")

# ============================================================================
# 8. 결과 분석
# ============================================================================

cat("========== 최종 선거 결과 예측 ==========\n\n")

# 최종일 (365일) 결과
final_baseline <- tail(out_baseline, 1)[2:5]
final_scandal <- tail(out_scandal, 1)[2:5]
final_unity <- tail(out_unity, 1)[2:5]

results <- data.frame(
  후보자 = top4$후보자,
  초기 = top4$여론지지율,
  기본시나리오 = as.numeric(final_baseline),
  스캔들시나리오 = as.numeric(final_scandal),
  단일화시나리오 = as.numeric(final_unity)
)

results <- results[order(-results$기본시나리오), ]

cat("【시나리오별 최종 지지율 예측】\n\n")
print(results)

cat("\n")
cat("💡 승자 예측:\n")
cat(sprintf("  기본: %s (%.1f%%)\n", 
            results$후보자[1], results$기본시나리오[1]))
cat(sprintf("  스캔들: %s (%.1f%%)\n", 
            results$후보자[which.max(results$스캔들시나리오)], 
            max(results$스캔들시나리오)))
cat(sprintf("  단일화: %s (%.1f%%)\n\n", 
            results$후보자[which.max(results$단일화시나리오)], 
            max(results$단일화시나리오)))

# CSV 저장
write.csv(results, "simulation_results.csv", 
          row.names = FALSE, fileEncoding = "UTF-8")
cat("✅ 저장: simulation_results.csv\n")

# Excel 파일 저장 (한글 안 깨짐!)
if(require(writexl, quietly = TRUE)) {
  writexl::write_xlsx(results, "simulation_results.xlsx")
  cat("✅ 저장: simulation_results.xlsx (엑셀용)\n")
} else {
  cat("⚠️  writexl 패키지 필요 - install.packages('writexl')\n")
}
cat("\n")

# ============================================================================
# 9. 시각화
# ============================================================================

cat("========== 그래프 생성 중... ==========\n\n")

# 데이터 변환
df_baseline <- as.data.frame(out_baseline)
names(df_baseline) <- c("day", top4$후보자, "무당층")

# PNG 저장
png("simulation_baseline.png", width = 1000, height = 600, res = 120)

par(mar = c(5, 5, 4, 2))
plot(df_baseline$day, df_baseline[, 2], type = "l", lwd = 3,
     col = "blue", ylim = c(0, 35),
     xlab = "일수 (오늘 → 선거일)", ylab = "지지율 (%)",
     main = "기본 시나리오: 지지율 변화 추이")

lines(df_baseline$day, df_baseline[, 3], lwd = 3, col = "red")
lines(df_baseline$day, df_baseline[, 4], lwd = 3, col = "green")
lines(df_baseline$day, df_baseline[, 5], lwd = 3, col = "purple")

legend("topright", legend = top4$후보자,
       col = c("blue", "red", "green", "purple"),
       lwd = 3, cex = 1.1)

abline(v = 365, lty = 2, col = "gray50", lwd = 2)
text(365, 32, "선거일", pos = 2, col = "gray50", cex = 1.1)

grid()
dev.off()

cat("✅ 저장: simulation_baseline.png\n")

# 시나리오 비교 그래프
png("simulation_comparison.png", width = 1200, height = 400, res = 120)

par(mfrow = c(1, 3), mar = c(5, 5, 4, 2))

# 기본
df_base <- as.data.frame(out_baseline)
plot(df_base[, 1], df_base[, 2], type = "l", lwd = 3, col = "blue",
     ylim = c(0, 35), xlab = "일수", ylab = "지지율 (%)",
     main = "기본 시나리오")
for(i in 3:5) lines(df_base[, 1], df_base[, i], lwd = 2, col = i-1)
grid()

# 스캔들
df_scan <- as.data.frame(out_scandal)
plot(df_scan[, 1], df_scan[, 2], type = "l", lwd = 3, col = "blue",
     ylim = c(0, 35), xlab = "일수", ylab = "지지율 (%)",
     main = "스캔들 시나리오")
for(i in 3:5) lines(df_scan[, 1], df_scan[, i], lwd = 2, col = i-1)
abline(v = 180, lty = 2, col = "red")
text(180, 33, "스캔들", pos = 4, col = "red")
grid()

# 단일화
df_uni <- as.data.frame(out_unity)
plot(df_uni[, 1], df_uni[, 2], type = "l", lwd = 3, col = "blue",
     ylim = c(0, 35), xlab = "일수", ylab = "지지율 (%)",
     main = "단일화 시나리오")
for(i in 3:5) lines(df_uni[, 1], df_uni[, i], lwd = 2, col = i-1)
abline(v = 270, lty = 2, col = "green")
text(270, 33, "단일화", pos = 4, col = "green")
grid()

dev.off()

cat("✅ 저장: simulation_comparison.png\n\n")

# ============================================================================
# 10. 완료
# ============================================================================

cat("============================================================\n")
cat("✅ 시뮬레이션 완료!\n")
cat("============================================================\n\n")

cat("생성된 파일:\n")
cat("  📊 simulation_results.csv - 시나리오별 결과표\n")
cat("  📈 simulation_baseline.png - 기본 시나리오 그래프\n")
cat("  📊 simulation_comparison.png - 시나리오 비교\n\n")

cat("🎯 핵심 결론:\n")
cat(sprintf("  현 추세 유지 시: %s 당선 예상 (%.1f%%)\n",
            results$후보자[1], results$기본시나리오[1]))
cat("\n")
