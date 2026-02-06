# ============================================================================
# 충청북도 도지사 후보 관계망 분석 - Phase 2
# R igraph를 이용한 네트워크 분석
# ============================================================================

library(igraph)
library(tidyverse)
library(visNetwork)
library(networkDynamic)
library(multinet)

# ============================================================================
# 1. 데이터 로드
# ============================================================================

# CSV 파일 로드
relationships <- read.csv("relationships_raw.csv", 
                         fileEncoding = "UTF-8")

# 후보자 정보 로드
candidates <- jsonlite::fromJSON("candidates_data.json")$candidates
candidates_df <- as.data.frame(do.call(rbind, candidates))

# ============================================================================
# 2. 네트워크 그래프 생성
# ============================================================================

# 엣지 데이터 준비
edges <- relationships %>%
  select(from = person1, to = person2, 
         weight = strength, type = relation_type, 
         sentiment, evidence, date) %>%
  filter(!is.na(from), !is.na(to))

# 노드 데이터 준비
nodes <- candidates_df %>%
  select(id = id, name = name, party, poll_support) %>%
  mutate(group = party)

# igraph 객체 생성 (무방향 그래프)
g <- graph_from_data_frame(d = edges, vertices = nodes, directed = FALSE)

# 그래프 기본 정보
cat("\n========== 네트워크 기본 정보 ==========\n")
cat(sprintf("노드 수: %d\n", vcount(g)))
cat(sprintf("엣지 수: %d\n", ecount(g)))
cat(sprintf("밀도: %.3f\n", edge_density(g)))
cat(sprintf("직경: %.3f\n", diameter(g)))

# ============================================================================
# 3. 중심성 분석 (CORE ANALYSIS)
# ============================================================================

cat("\n========== 중심성 분석 시작 ==========\n")

## 3.1 연결 중심성 (Degree Centrality)
# 의미: 직접 연결된 인맥 수
degree_scores <- degree(g, mode = "all", normalized = TRUE)

## 3.2 매개 중심성 (Betweenness Centrality) ⭐ 가장 중요
# 의미: 다른 파벌을 연결하는 "킹메이커" 역할
betweenness_scores <- betweenness(g, normalized = TRUE)

## 3.3 근접 중심성 (Closeness Centrality)
# 의미: 정보 확산 속도
closeness_scores <- closeness(g, mode = "all", normalized = TRUE)

## 3.4 아이겐벡터 중심성 (Eigenvector Centrality)
# 의미: 영향력 있는 사람과 연결된 정도
eigenvector_scores <- eigen_centrality(g)$vector

## 3.5 페이지랭크 (PageRank)
# 의미: 실질적 영향력 (구글 알고리즘)
pagerank_scores <- page_rank(g)$vector

# 결과 통합
centrality_scores <- data.frame(
  candidate = V(g)$name,
  degree = degree_scores,
  betweenness = betweenness_scores,
  closeness = closeness_scores,
  eigenvector = eigenvector_scores,
  pagerank = pagerank_scores,
  poll_support = as.numeric(V(g)$poll_support)
)

# 정규화 (0-1 스케일)
centrality_scores <- centrality_scores %>%
  mutate(across(degree:pagerank, ~(.x - min(.x)) / (max(.x) - min(.x))))

# 종합 점수 계산
centrality_scores <- centrality_scores %>%
  mutate(
    composite_score = betweenness * 0.4 + 
                     pagerank * 0.3 + 
                     degree * 0.2 + 
                     eigenvector * 0.1
  ) %>%
  arrange(desc(composite_score))

# 결과 출력
cat("\n========== 중심성 점수 순위 ==========\n")
print(centrality_scores %>% 
      select(candidate, betweenness, pagerank, composite_score, poll_support))

# CSV 저장
write.csv(centrality_scores, "centrality_scores.csv", 
          row.names = FALSE, fileEncoding = "UTF-8")

# ============================================================================
# 4. 커뮤니티 탐지 (파벌 분석)
# ============================================================================

cat("\n========== 커뮤니티 탐지 (파벌 분류) ==========\n")

# Louvain 알고리즘
communities <- cluster_louvain(g)

# 결과
cat(sprintf("탐지된 커뮤니티 수: %d\n", max(communities$membership)))
cat("\n커뮤니티별 구성원:\n")

for(i in 1:max(communities$membership)) {
  members <- V(g)$name[communities$membership == i]
  cat(sprintf("커뮤니티 %d: %s\n", i, paste(members, collapse = ", ")))
}

# 그래프에 커뮤니티 정보 추가
V(g)$community <- communities$membership

# Modularity (커뮤니티 분리도)
cat(sprintf("\nModularity: %.3f\n", modularity(communities)))

# ============================================================================
# 5. 지역별 네트워크 구조 분석
# ============================================================================

cat("\n========== 지역별 분석 ==========\n")

# 후보자 출신 지역 (hometown에서 시/군 추출)
nodes_with_region <- candidates_df %>%
  mutate(
    region = case_when(
      grepl("청주", hometown) ~ "청주",
      grepl("진천", hometown) ~ "진천", 
      grepl("충주", hometown) ~ "충주",
      TRUE ~ "기타"
    )
  )

# 지역별 네트워크 밀도
for(region in unique(nodes_with_region$region)) {
  region_nodes <- nodes_with_region %>% filter(region == !!region) %>% pull(name)
  region_subgraph <- induced_subgraph(g, V(g)[V(g)$name %in% region_nodes])
  
  if(vcount(region_subgraph) > 1) {
    cat(sprintf("%s 지역 밀도: %.3f\n", region, edge_density(region_subgraph)))
  }
}

# ============================================================================
# 6. 시각화 (Interactive visNetwork)
# ============================================================================

cat("\n========== 인터랙티브 시각화 생성 ==========\n")

# visNetwork용 노드 데이터
vis_nodes <- data.frame(
  id = V(g)$name,
  label = V(g)$name,
  group = V(g)$party,
  value = centrality_scores$composite_score * 100,  # 노드 크기
  title = paste0(
    "<b>", V(g)$name, "</b><br>",
    "정당: ", V(g)$party, "<br>",
    "지지율: ", V(g)$poll_support, "%<br>",
    "매개중심성: ", round(centrality_scores$betweenness, 3), "<br>",
    "페이지랭크: ", round(centrality_scores$pagerank, 3)
  )
)

# visNetwork용 엣지 데이터
vis_edges <- data.frame(
  from = edges$from,
  to = edges$to,
  value = edges$weight * 10,  # 엣지 두께
  title = edges$evidence,
  color = case_when(
    edges$sentiment == "긍정" ~ "green",
    edges$sentiment == "부정" ~ "red",
    TRUE ~ "gray"
  )
)

# 시각화
vis_network <- visNetwork(vis_nodes, vis_edges, height = "800px", width = "100%") %>%
  visGroups(groupname = "더불어민주당", color = "blue") %>%
  visGroups(groupname = "국민의힘", color = "red") %>%
  visOptions(highlightNearest = TRUE, nodesIdSelection = TRUE) %>%
  visInteraction(navigationButtons = TRUE, 
                 keyboard = TRUE) %>%
  visLayout(randomSeed = 42) %>%
  visPhysics(stabilization = TRUE)

# HTML 저장
visSave(vis_network, "network_visualization.html")
cat("시각화 저장: network_visualization.html\n")

# ============================================================================
# 7. 선거 영향력 지수 계산
# ============================================================================

cat("\n========== 선거 영향력 지수 ==========\n")

# 영향력 지수 = 0.3 * 매개중심성 + 0.3 * 페이지랭크 + 
#              0.2 * 여론지지율(정규화) + 0.2 * 연결중심성

influence_index <- centrality_scores %>%
  mutate(
    poll_normalized = poll_support / max(poll_support),
    influence_score = betweenness * 0.3 + 
                     pagerank * 0.3 + 
                     poll_normalized * 0.2 + 
                     degree * 0.2
  ) %>%
  arrange(desc(influence_score)) %>%
  select(candidate, influence_score, composite_score, poll_support)

print(influence_index)

write.csv(influence_index, "influence_index.csv",
          row.names = FALSE, fileEncoding = "UTF-8")

# ============================================================================
# 8. 요약 리포트 생성
# ============================================================================

cat("\n========== 분석 완료 ==========\n")
cat("생성된 파일:\n")
cat("  - centrality_scores.csv : 중심성 점수\n")
cat("  - influence_index.csv : 선거 영향력 지수\n")
cat("  - network_visualization.html : 인터랙티브 시각화\n")
cat("\n다음 단계: Phase 3 (시스템 다이내믹스 모델링)\n")
