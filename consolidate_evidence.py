import csv
import json
import os

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

    regional = []
    if os.path.exists('regional_dominance_data.csv'):
        with open('regional_dominance_data.csv', mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                regional.append(row)

    stress = []
    if os.path.exists('stress_test_summary.csv'):
        with open('stress_test_summary.csv', mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stress.append(row)

    evidence_data = {
        "centrality": centrality,
        "relationships": relationships,
        "regional": regional,
        "stress": stress
    }

    with open('evidence_data.json', 'w', encoding='utf-8') as f:
        json.dump(evidence_data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    consolidate_evidence()
