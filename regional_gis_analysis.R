# ============================================================================
# Step 3: 충북 지역별 지배력 분석 및 GIS 시각화 (Hex-Grid Map)
# sf 패키지 없이 기본 ggplot2로 구현하는 충북 11개 시군 분석
# ============================================================================

library(ggplot2)
library(dplyr)
library(jsonlite)

# 윈도우 경로 정규화 함수
get_safe_path <- function(filename) {
  file.path(getwd(), filename)
}

# ============================================================================
# 1. 충북 11개 시군 좌표 정의 (Hexagonal Grid 컨셉)
# ============================================================================

chungbuk_regions <- data.frame(
  region = c("청주", "충주", "제천", "단양", "음성", "진천", "괴산", "증평", "보은", "옥천", "영동"),
  x = c(2, 4, 6, 7, 3, 2, 4, 3, 4, 3, 3), # 수평 위치
  y = c(4, 6, 7, 7, 6, 5, 5, 5, 4, 3, 2)  # 수직 위치
)

# ============================================================================
# 2. 후보자별 지역적 연고(Stronghold) 매핑
# ============================================================================

# 데이터 로드
candidates <- fromJSON(get_safe_path("candidates_data.json"))$candidates
scores <- read.csv(get_safe_path("centrality_scores_multilayer.csv"), fileEncoding = "UTF-8")

# 지역별 점수 계산 프레임워크
# 1. 출신지(Hometown) 점수: 5.0
# 2. 경력지(Career) 점수: 3.0
# 3. 네트워크 영향력 반영

regional_dominance <- expand.grid(
  region = chungbuk_regions$region,
  candidate = candidates$name
) %>% left_join(chungbuk_regions, by = "region")

# 연고 점수 계산 함수
calculate_origin_score <- function(cand_name, reg_name) {
  cand <- candidates[candidates$name == cand_name, ]
  score <- 0
  
  # 출신지 가중치
  if(grepl(reg_name, cand$hometown)) score <- score + 5.0
  
  # 경력지 가당치
  career_text <- paste(unlist(cand$career), collapse = " ")
  if(grepl(reg_name, career_text)) score <- score + 3.0
  
  return(score)
}

# 모든 조합에 대해 점수 산출
regional_dominance$base_score <- mapply(calculate_origin_score, 
                                       regional_dominance$candidate, 
                                       regional_dominance$region)

# 네트워크 종합 지수와 결합
regional_dominance <- regional_dominance %>%
  left_join(scores %>% select(name, Total_Influence), by = c("candidate" = "name")) %>%
  mutate(final_score = base_score * (1 + Total_Influence))

# 지역별 1위 후보 도출
region_winners <- regional_dominance %>%
  group_by(region) %>%
  filter(final_score == max(final_score)) %>%
  slice(1) %>% # 동점 시 첫 번째
  ungroup()

# ============================================================================
# 3. 시각화 (Hex Map)
# ============================================================================

# 정당 색상 매핑
party_colors <- c("더불어민주당" = "#0066CC", "국민의힘" = "#E61E2B")
candidates_party <- data.frame(candidate = candidates$name, party = candidates$party)
region_winners <- region_winners %>% left_join(candidates_party, by = "candidate")

p <- ggplot(region_winners, aes(x = x, y = y)) +
  # 지역 블록
  geom_tile(aes(fill = party), color = "white", size = 2, width = 0.9, height = 0.9) +
  # 지역명
  geom_text(aes(label = region), nudge_y = 0.2, size = 5, fontface = "bold", color = "white") +
  # 1위 후보명
  geom_text(aes(label = candidate), nudge_y = -0.2, size = 4, color = "white") +
  scale_fill_manual(values = party_colors) +
  labs(title = "2026 충북도지사 후보 지역별 지배력 지도",
       subtitle = "출신지, 경력, 네트워크 영향력을 통합한 지역별 우세 지역 분석",
       caption = "데이터: candidates_data.json, centrality_scores_multilayer.csv",
       fill = "우세 정당") +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, size = 18, face = "bold"),
        plot.subtitle = element_text(hjust = 0.5, size = 12),
        legend.position = "bottom")

# 결과 저장
ggsave(get_safe_path("regional_dominance_map.png"), p, width = 8, height = 10, dpi = 300)

# 지역별 점수 데이터 저장
write.csv(regional_dominance, get_safe_path("regional_dominance_data.csv"), 
          row.names = FALSE, fileEncoding = "UTF-8")

cat("\n✅ Step 3: 지역별 GIS 분석 완료!\n")
cat("생성된 파일:\n")
cat("  - regional_dominance_map.png (지역 지배력 지도)\n")
cat("  - regional_dominance_data.csv (지역별 상세 통계)\n\n")
