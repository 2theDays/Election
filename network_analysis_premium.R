# ============================================================================
# 충청북도 도지사 후보 관계망 분석 - 고품질 다층(Multilayer) 분석 버전
# Official(공식), Private(학연/지연), Sentiment(감성) 레이어 분리 분석
# ============================================================================

cat("\n")
cat("============================================================\n")
cat("충청북도 도지사 후보 다층 관계망 분석 시스템 (V2.0)\n")
cat("Phase 2: 다층 네트워크 분석 및 입체적 영향력 평가\n")
cat("============================================================\n\n")

# ============================================================================
# 1. 패키지 로딩 및 환경 설정
# ============================================================================

cat("패키지 로딩 중...\n")

suppressPackageStartupMessages({
  library(igraph)
  library(jsonlite)
  library(dplyr)
  library(tidyr)
})

# 윈도우 한글 깨짐 방지 및 경로 설정
if(.Platform$OS.type == "windows") {
  # setlocale(category = "LC_ALL", locale = "Korean") # 필요시 활성화
}

get_safe_path <- function(filename) {
  # 현재 작업 디렉토리의 파일 경로 반환
  file.path(getwd(), filename)
}

cat("✅ 환경 설정 완료!\n\n")

# ============================================================================
# 2. 데이터 로드
# ============================================================================

cat("데이터 로딩 중...\n")

# CSV 파일 로드
rel_file <- get_safe_path("relationships_raw.csv")
if(!file.exists(rel_file)) {
  stop(paste("오류: 파일을 찾을 수 없습니다 -", rel_file))
}

relationships <- read.csv(rel_file, 
                         fileEncoding = "UTF-8",
                         stringsAsFactors = FALSE)

# 후보자 정보 로드
cand_file <- get_safe_path("candidates_data.json")
candidates <- fromJSON(cand_file)$candidates

cat(sprintf("✅ %d개 관계 데이터 로드 완료\n", nrow(relationships)))
cat(sprintf("✅ %d명 후보자 프로필 로드 완료\n\n", length(candidates$name)))

# ============================================================================
# 3. 레이어 분류 (Multilayer Framework)
# ============================================================================

cat("다층 네트워크 구조 생성 중...\n")

# 관계 유형별 레이어 수동 매핑
relationships <- relationships %>%
  mutate(layer = case_when(
    relation_type %in% c("정치적동맹", "경쟁", "협력", "비판") ~ "Official",
    relation_type %in% c("학연", "지연", "사제") ~ "Private",
    TRUE ~ "Public_Opinion"
  ))

# 엣지 데이터 준비
edges_all <- relationships %>%
  mutate(weight = as.numeric(strength)) %>%
  filter(!is.na(weight)) # 가중치가 없는 데이터는 분석에서 제외

# 노드 데이터 구성
candidate_nodes <- data.frame(
  name = candidates$name,
  party = candidates$party,
  poll = as.numeric(candidates$poll_support),
  stringsAsFactors = FALSE
)

all_persons <- unique(c(edges_all$person1, edges_all$person2))
other_persons <- setdiff(all_persons, candidate_nodes$name)

if(length(other_persons) > 0) {
  other_nodes <- data.frame(
    name = other_persons,
    party = "기타",
    poll = 0,
    stringsAsFactors = FALSE
  )
  nodes <- rbind(candidate_nodes, other_nodes)
} else {
  nodes <- candidate_nodes
}

# ============================================================================
# 4. 레이어별 그래프 생성 및 분석
# ============================================================================

layers <- unique(relationships$layer)
analysis_results <- list()

for(l in layers) {
  cat(sprintf("\n【 %s 레이어 분석 중... 】\n", l))
  
  layer_edges <- edges_all %>% filter(layer == l)
  
  # 해당 레이어에 관계가 있는 노드들만 포함하거나 모든 노드 유지
  # 여기서는 모든 후보자 노드를 유지하여 비교 가능하게 함
  g_layer <- graph_from_data_frame(d = layer_edges %>% select(person1, person2, weight, everything()), 
                                  vertices = nodes, 
                                  directed = FALSE)
  
  # 지표 계산
  d_cent <- degree(g_layer, mode = "all")
  b_cent <- betweenness(g_layer, normalized = TRUE)
  p_rank <- page_rank(g_layer)$vector
  
  analysis_results[[l]] <- data.frame(
    name = V(g_layer)$name,
    layer = l,
    degree = d_cent,
    betweenness = b_cent,
    pagerank = p_rank
  )
}

# 결과 통합
combined_results <- bind_rows(analysis_results)

# ============================================================================
# 5. 다층 네트워크 종합 지표 산출
# ============================================================================

cat("\n========== 다층 네트워크 종합 영향력 순위 ==========\n\n")

# 후보자별 레이어별 점수 피벗
final_summary <- combined_results %>%
  filter(name %in% candidates$name) %>%
  group_by(name) %>%
  summarize(
    Official_Influence = sum(pagerank[layer == "Official"], na.rm = TRUE),
    Private_Cohesion = sum(betweenness[layer == "Private"], na.rm = TRUE),
    Sentiment_Score = sum(degree[layer == "Public_Opinion"], na.rm = TRUE)
  ) %>%
  left_join(candidate_nodes, by = "name") %>%
  mutate(
    # 종합 영향력 지수: 공식(40%) + 인맥(40%) + 여론(20%)
    Total_Influence = Official_Influence * 0.4 + 
                     Private_Cohesion * 0.4 + 
                     (Sentiment_Score / max(Sentiment_Score + 0.01)) * 0.2
  ) %>%
  arrange(desc(Total_Influence))

# 출력
print(final_summary %>% 
      select(name, party, Official_Influence, Private_Cohesion, Total_Influence, poll))

cat("\n💡 다층 데이터 해석 가이드:\n")
cat("  - Official_Influence: 정당 및 정치권 내 실질적 파워\n")
cat("  - Private_Cohesion: 학연/지연 기반의 견고한 '백그라운드' (위기 시 방어력)\n")
cat("  - Total_Influence: 다양한 레이어를 통합한 최종 당선 잠재력\n")

# ============================================================================
# 6. 커뮤니티 탐지 및 파벌 시각화
# ============================================================================

# 전체 네트워크 (통합)
g_total <- graph_from_data_frame(d = edges_all %>% select(person1, person2, weight), 
                               vertices = nodes, 
                               directed = FALSE)

communities <- cluster_louvain(g_total)
V(g_total)$community <- communities$membership

cat(sprintf("\n✅ 탐지된 정치적 파벌(Community): %d개\n", max(communities$membership)))

# ============================================================================
# 7. 결과 저장 및 종료
# ============================================================================

# CSV 저장
write.csv(final_summary, get_safe_path("centrality_scores_multilayer.csv"), 
          row.names = FALSE, fileEncoding = "UTF-8")

# 고해상도 시각화 (PNG)
png(get_safe_path("network_graph_multilayer.png"), width = 1500, height = 1500, res = 200)

layout_main <- layout_with_kk(g_total)
colors <- c("skyblue", "tomato", "gold", "lightgreen", "violet")

plot(g_total,
     vertex.size = nodes$poll * 2 + 5,
     vertex.color = colors[V(g_total)$community],
     vertex.label = V(g_total)$name,
     vertex.label.cex = 0.9,
     vertex.label.dist = 1.2,
     edge.width = E(g_total)$weight * 2,
     edge.color = "gray80",
     main = "2026 충북도지사 후보 다층 네트워크 분석",
     sub = "노드 크기: 현재 지지율 | 색상: 탐지된 파벌(Community)")

dev.off()

cat("\n============================================================\n")
cat("✅ 개선된 다층 분석 완료!\n")
cat("생성된 파일:\n")
cat("  - centrality_scores_multilayer.csv\n")
cat("  - network_graph_multilayer.png\n")
cat("============================================================\n\n")
