# ============================================================================
# Step 5: 리스크 및 취약점 분석 (Stress Test Engine)
# 특정 지표 상실 시 후보자별 지지율 붕괴 및 회복 탄력성 측정
# ============================================================================

library(deSolve)
library(dplyr)
library(jsonlite)
library(tidyr)
library(ggplot2)

# 윈도우 경로 정규화 함수
get_safe_path <- function(filename) {
  file.path(getwd(), filename)
}

# 1. 데이터 로드
scores <- read.csv(get_safe_path("centrality_scores_multilayer.csv"), fileEncoding = "UTF-8")
candidates <- fromJSON(get_safe_path("candidates_data.json"))$candidates

# SD 모델 로직 로드 (코드를 재사용하기 위해 함수화)
# deSolve에서 사용할 수 있는 기본 동태 함수
source(get_safe_path("sd_model_deSolve.R")) # 기존 모델 로드 (혹은 내부 함수 추출)

# ============================================================================
# 2. 스트레스 테스트 시나리오 정의
# ============================================================================

run_stress_simulation <- function(cand_name, failure_type) {
  # 초기 파라미터 복제
  # (실제 서비스에서는 sd_model_deSolve.R의 파라미터 생성 로직을 호출)
  
  # 지표 추출
  target_idx <- which(scores$name == cand_name)
  temp_scores <- scores
  
  msg <- ""
  if (failure_type == "Official_Collapse") {
    temp_scores$Official_Influence[target_idx] <- temp_scores$Official_Influence[target_idx] * 0.1
    msg <- "공당 지지 철회 및 정치적 권위 붕괴"
  } else if (failure_type == "Private_Isolation") {
    temp_scores$Private_Cohesion[target_idx] <- 0
    msg <- "핵심 인맥(학연/지연) 배신 및 조직력 상실"
  } else if (failure_type == "Sentiment_Backlash") {
    temp_scores$Sentiment_Score[target_idx] <- -0.5
    msg <- "여론의 극심한 악화 (Echo Chamber 역풍)"
  }
  
  # 이 데이터로 100일간 시뮬레이션 돌려 지지율 하락폭 측정
  # (간소화된 하락 모델 적용)
  baseline_influence <- scores$Total_Influence[target_idx]
  stressed_influence <- (temp_scores$Official_Influence[target_idx] * 0.4 + 
                         temp_scores$Private_Cohesion[target_idx] * 0.4 + 
                         temp_scores$Sentiment_Score[target_idx] * 0.2)
  
  drop_rate <- (baseline_influence - stressed_influence) / max(baseline_influence, 0.01)
  
  return(list(
    candidate = cand_name,
    scenario = failure_type,
    description = msg,
    risk_index = round(drop_rate * 100, 2), # 하락 예상비율
    resilience = round(100 - (drop_rate * 100), 2) # 회복 탄력성
  ))
}

# ============================================================================
# 3. 전 후보자 대상 스트레스 테스트 실행
# ============================================================================

scenarios <- c("Official_Collapse", "Private_Isolation", "Sentiment_Backlash")
test_results <- list()

cat("\n🛡️ 스트레스 테스트(리스크 분석) 시작...\n")

for (cand in candidates$name) {
  for (scen in scenarios) {
    res <- run_stress_simulation(cand, scen)
    test_results[[length(test_results) + 1]] <- res
  }
}

stress_df <- bind_rows(test_results)

# 4. 취약점 리포트 생성
stress_summary <- stress_df %>%
  group_by(candidate) %>%
  summarize(
    Avg_Risk = mean(risk_index),
    Max_Vulnerability = max(risk_index),
    Crit_Scenario = scenario[which.max(risk_index)],
    Resilience_Score = mean(resilience)
  ) %>%
  arrange(desc(Max_Vulnerability))

# 결과 저장
write.csv(stress_df, get_safe_path("stress_test_details.csv"), row.names = FALSE, fileEncoding = "UTF-8")
write.csv(stress_summary, get_safe_path("stress_test_summary.csv"), row.names = FALSE, fileEncoding = "UTF-8")

# 시각화 (레이더 차트 대신 막대 그래프로 취약도 표시)
p <- ggplot(stress_df, aes(x = candidate, y = risk_index, fill = scenario)) +
  geom_bar(stat = "identity", position = "dodge") +
  labs(title = "후보자별 시나리오별 리스크 취약도(Risk Vulnerability)",
       subtitle = "지표 상실 시 예상 지지율 하락 강도(%)",
       x = "후보자", y = "리스크 지수(%)",
       fill = "위기 시나리오") +
  theme_minimal() +
  theme(plot.title = element_text(face="bold", size=16))

ggsave(get_safe_path("risk_analysis_chart.png"), p, width=10, height=6)

cat("\n✅ Step 5: 리스크 분석 완료!\n")
cat("생성된 파일:\n")
cat("  - stress_test_summary.csv (후보별 취약점 요약)\n")
cat("  - risk_analysis_chart.png (취약도 시각화)\n\n")
