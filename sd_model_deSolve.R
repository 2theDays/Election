# ============================================================================
# Phase 3B: R deSolve를 이용한 시스템 다이내믹스 모델 (개선 버전)
# 다층 네트워크 지표(Official, Private, Sentiment)를 시뮬레이션에 반영
# ============================================================================

library(deSolve)
library(ggplot2)
library(dplyr)
library(tidyr)

# 윈도우 경로 정규화 함수
get_safe_path <- function(filename) {
  file.path(getwd(), filename)
}

# ============================================================================
# 1. 다층 네트워크 지표 로드 (Phase 2 개선 결과)
# ============================================================================

scores_file <- get_safe_path("centrality_scores_multilayer.csv")
if(!file.exists(scores_file)) {
  # 만약 다층 점수 파일이 없으면 기존 파일이라도 시도
  scores_file <- get_safe_path("centrality_scores.csv")
}

centrality_scores <- read.csv(scores_file, fileEncoding = "UTF-8")

# 각 후보의 다층 네트워크 지표 추출
get_multilayer_metrics <- function(candidate_name) {
  row <- centrality_scores[centrality_scores$name == candidate_name, ]
  if(nrow(row) == 0) return(list(official=0, private=0, sentiment=0))
  
  # 데이터 구조에 따라 매핑 (기존/신규 호환)
  if("Official_Influence" %in% names(centrality_scores)) {
    list(
      official = row$Official_Influence,
      private = row$Private_Cohesion,
      sentiment = row$Sentiment_Score
    )
  } else {
    # 기존 파일인 경우 매핑
    list(
      official = row$pagerank,
      private = row$betweenness,
      sentiment = row$degree
    )
  }
}

# ============================================================================
# 2. 미분방정식 시스템 정의
# ============================================================================

election_dynamics <- function(t, state, parameters) {
  with(as.list(c(state, parameters)), {
    
    # === Stock 변수 ===
    S_shin <- state[1]      # 신용한 지지층
    S_roh <- state[2]       # 노영민 지지층  
    S_song <- state[3]      # 송기섭 지지층
    S_han <- state[4]       # 한범덕 지지층
    U <- state[5]           # 무당층
    G <- state[6]           # 포기층
    
    # === [전략 개선 1] 지표별 시간 감쇠(Time-Decay) 및 전이 로직 ===
    # 선거 초기: 조직/연고 중요, 선거 막판: 여론/감성 결정적
    t_ratio <- t / 365
    w_off   <- 0.4 * exp(-0.3 * t_ratio)  # 공식 파워의 점진적 감쇠
    w_priv  <- 0.3 * exp(-0.7 * t_ratio)  # 조직/인맥의 급격한 감쇠 (막판 평탄화)
    w_sent  <- 0.3 + (0.4 * t_ratio^2)    # 여론 영향력의 가속적 강화
    
    # === 커뮤니티 가중치 계산 함수 ===
    get_comm_weight <- function(cand_name) {
      echo_file <- get_safe_path("community_sentiment_summary.csv")
      if(!file.exists(echo_file)) return(list(impact=1.0, pol=1.0))
      
      echo_data <- read.csv(echo_file, fileEncoding = "UTF-8")
      cand_echo <- echo_data %>% filter(candidate == cand_name)
      
      if(nrow(cand_echo) > 0) {
        avg_strength <- mean(cand_echo$strength, na.rm = TRUE)
        avg_pol <- mean(cand_echo$polarization, na.rm = TRUE)
        return(list(impact = 1 + (avg_strength * 0.2), pol = 1 - (avg_pol * 0.3)))
      }
      return(list(impact=1.0, pol=1.0))
    }

    # === [전략 개선 2] 지역적 지배력 가중치 정교화 (청주권 비중 강화) ===
    get_regional_weight <- function(cand_name) {
      reg_file <- get_safe_path("regional_dominance_data.csv")
      if(!file.exists(reg_file)) return(1.0)
      
      reg_data <- read.csv(reg_file, fileEncoding = "UTF-8")
      cand_reg <- reg_data %>% filter(candidate == cand_name)
      
      if(nrow(cand_reg) > 0) {
        cheongju_score <- cand_reg %>% filter(region == "청주") %>% pull(final_score)
        other_score <- cand_reg %>% filter(region != "청주") %>% summarize(s = sum(final_score)) %>% pull(s)
        
        # 청주권(0.6) 가중치 부여 (실제 유권자수 및 영향력 반영)
        reg_index <- (cheongju_score * 0.6 + (other_score / 10) * 0.4) / 10
        return(1 + reg_index)
      }
      return(1.0)
    }

    # === [전략 개선 3] 정치 이벤트의 휘발성(Half-life) 모델링 ===
    get_event_shock <- function(cand_name, current_t) {
      event_file <- get_safe_path("event_impact_result.json")
      if(!file.exists(event_file)) return(list(off=0, priv=0, sent=0, reg=0))
      
      event_data <- fromJSON(event_file)$impact_matrix[[cand_name]]
      if(is.null(event_data)) return(list(off=0, priv=0, sent=0, reg=0))
      
      # 이벤트 발생 시점 이후 감쇄 (반감기 약 45일 설정)
      event_start_t <- 150
      days_since <- current_t - event_start_t
      
      if(days_since < 0) return(list(off=0, priv=0, sent=0, reg=0))
      
      decay_factor <- exp(-0.015 * days_since) # 지수 감쇠
      
      return(list(
        off  = as.numeric(event_data$official) * decay_factor,
        priv = as.numeric(event_data$private) * decay_factor,
        sent = as.numeric(event_data$sentiment) * decay_factor,
        reg  = as.numeric(event_data$regional) * decay_factor
      ))
    }

    # === 최종 임팩트 계산 (전략적 보정 통합) ===
    calc_impact <- function(off, priv, sent, cand_name, current_t) {
      weights <- get_comm_weight(cand_name)
      reg_weight <- get_regional_weight(cand_name)
      ev <- get_event_shock(cand_name, current_t)
      
      total_impact <- (off + ev$off) * w_off + 
                      (priv + ev$priv) * w_priv + 
                      (sent + ev$sent) * w_sent
      
      return(total_impact * weights$impact * weights$pol * (reg_weight + ev$reg))
    }
    
    impact_shin <- calc_impact(off_shin, priv_shin, sent_shin, "신용한", t)
    impact_roh  <- calc_impact(off_roh,  priv_roh,  sent_roh,  "노영민", t)
    impact_song <- calc_impact(off_song, priv_song, sent_song, "송기섭", t)
    impact_han  <- calc_impact(off_han,  priv_han,  sent_han,  "한범덕", t)
    
    # === Flow 계산: 무당층 → 지지층 유입 ===
    inflow_shin <- U * impact_shin * base_inflow_coef
    inflow_roh  <- U * impact_roh  * base_inflow_coef * (1 - unity_enabled) # 단일화시 정지
    inflow_song <- U * impact_song * base_inflow_coef
    inflow_han  <- U * impact_han  * base_inflow_coef
    
    # === Flow 계산: 지지층 → 무당층 이탈 (네트워크 결속도 반영) ===
    # Private Cohesion(인맥 결속도)이 높을수록 이탈률 감소
    outflow_shin <- S_shin * base_outflow_coef / (1 + priv_shin * 10)
    outflow_roh  <- S_roh  * base_outflow_coef / (1 + priv_roh * 10)
    outflow_song <- S_song * base_outflow_coef / (1 + priv_song * 10)
    outflow_han  <- S_han  * base_outflow_coef / (1 + priv_han * 10)
    
    # === 단일화 전이 (노영민 → 신용한) ===
    unity_transfer <- ifelse(t >= unity_time && unity_enabled == 1, S_roh * 0.8, 0)
    
    # === 미분 방정식 ===
    dS_shin <- inflow_shin - outflow_shin + unity_transfer
    dS_roh  <- inflow_roh  - outflow_roh  - unity_transfer
    dS_song <- inflow_song - outflow_song
    dS_han  <- inflow_han  - outflow_han
    
    dU <- (outflow_shin + outflow_roh + outflow_song + outflow_han) -
          (inflow_shin + inflow_roh + inflow_song + inflow_han)
    dG <- (S_shin + S_roh + S_song + S_han) * 0.0001 # 기본 정치혐오 포기율
    
    return(list(c(dS_shin, dS_roh, dS_song, dS_han, dU, dG)))
  })
}

# ============================================================================
# 3. 데이터 로드 및 시뮬레이션 실행
# ============================================================================

m_shin <- get_multilayer_metrics("신용한")
m_roh  <- get_multilayer_metrics("노영민")
m_song <- get_multilayer_metrics("송기섭")
m_han  <- get_multilayer_metrics("한범덕")

parameters <- c(
  off_shin = m_shin$official, priv_shin = m_shin$private, sent_shin = m_shin$sentiment,
  off_roh  = m_roh$official,  priv_roh  = m_roh$private,  sent_roh  = m_roh$sentiment,
  off_song = m_song$official, priv_song = m_song$private, sent_song = m_song$sentiment,
  off_han  = m_han$official,  priv_han  = m_han$private,  sent_han  = m_han$sentiment,
  
  base_inflow_coef = 0.02,
  base_outflow_coef = 0.01,
  unity_time = 200,
  unity_enabled = 0
)

initial_state <- c(S_shin=221000, S_roh=168000, S_song=103000, S_han=106000, U=402000, G=0)
times <- seq(0, 365, by = 1)

out <- ode(y = initial_state, times = times, func = election_dynamics, parms = parameters)
df_res <- as.data.frame(out)
colnames(df_res) <- c("time", "신용한", "노영민", "송기섭", "한범덕", "무당층", "포기층")

# 시각화
df_long <- df_res %>%
  select(-무당층, -포기층) %>%
  pivot_longer(-time, names_to = "candidate", values_to = "support")

p <- ggplot(df_long, aes(x=time, y=support/10000, color=candidate)) +
  geom_line(size=1.2) +
  labs(title="2026 충북도지사 선거 다층 모델 시뮬레이션",
       subtitle="공식 영향력/인맥 결속도/여론 감성을 통합한 예측",
       x="경과 일수", y="예상 지지표 (만 명)") +
  theme_minimal()

ggsave(get_safe_path("simulation_multilayer_baseline.png"), p, width=10, height=6)

cat("\n✅ 시뮬레이션 완료 및 결과 저장 완료!\n")
cat("결과 파일: simulation_multilayer_baseline.png\n\n")
