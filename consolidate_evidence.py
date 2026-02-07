import csv
import json

def consolidate_evidence():
    centrality = []
    with open('centrality_scores.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            centrality.append(row)

    relationships = []
    with open('relationships_raw.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            relationships.append(row)

    evidence_data = {
        "centrality": centrality,
        "relationships": relationships
    }

    with open('evidence_data.json', 'w', encoding='utf-8') as f:
        json.dump(evidence_data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    consolidate_evidence()
