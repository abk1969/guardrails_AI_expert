#!/usr/bin/env python3
"""
Script d'analyse des résultats GARAK
Usage: python analyze_results.py garak.report.jsonl
"""

import json
import sys
from collections import defaultdict
from pathlib import Path


def analyze_garak_report(report_file: str):
    """Analyse un fichier de rapport GARAK JSONL"""
    
    if not Path(report_file).exists():
        print(f"❌ Fichier non trouvé: {report_file}")
        sys.exit(1)
    
    # Statistiques
    stats = {
        'total_attempts': 0,
        'vulnerabilities_found': 0,
        'by_probe': defaultdict(lambda: {'total': 0, 'hits': 0}),
        'by_detector': defaultdict(lambda: {'total': 0, 'hits': 0}),
        'hit_examples': []
    }
    
    # Lire le rapport
    with open(report_file, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            
            try:
                entry = json.loads(line)
                stats['total_attempts'] += 1
                
                probe = entry.get('probe', 'unknown')
                detector = entry.get('detector', 'unknown')
                score = entry.get('score', 0)
                
                # Compter par probe
                stats['by_probe'][probe]['total'] += 1
                if score > 0:
                    stats['by_probe'][probe]['hits'] += 1
                    stats['vulnerabilities_found'] += 1
                    
                    # Garder un exemple
                    if len(stats['hit_examples']) < 5:
                        stats['hit_examples'].append({
                            'probe': probe,
                            'detector': detector,
                            'prompt': entry.get('prompt', '')[:100] + '...',
                            'output': entry.get('output', '')[:100] + '...',
                            'score': score
                        })
                
                # Compter par détecteur
                stats['by_detector'][detector]['total'] += 1
                if score > 0:
                    stats['by_detector'][detector]['hits'] += 1
                    
            except json.JSONDecodeError:
                continue
    
    # Afficher les résultats
    print("\n" + "="*80)
    print("📊 ANALYSE DES RÉSULTATS GARAK")
    print("="*80)
    
    print(f"\n📈 Statistiques Globales:")
    print(f"  • Total de tentatives: {stats['total_attempts']}")
    print(f"  • Vulnérabilités trouvées: {stats['vulnerabilities_found']}")
    print(f"  • Taux de réussite: {stats['vulnerabilities_found']/stats['total_attempts']*100:.2f}%")
    
    print(f"\n🎯 Résultats par Probe:")
    for probe, data in sorted(stats['by_probe'].items(), 
                              key=lambda x: x[1]['hits'], 
                              reverse=True):
        if data['hits'] > 0:
            rate = data['hits'] / data['total'] * 100
            print(f"  • {probe}: {data['hits']}/{data['total']} ({rate:.1f}%)")
    
    print(f"\n🔍 Résultats par Détecteur:")
    for detector, data in sorted(stats['by_detector'].items(), 
                                 key=lambda x: x[1]['hits'], 
                                 reverse=True):
        if data['hits'] > 0:
            rate = data['hits'] / data['total'] * 100
            print(f"  • {detector}: {data['hits']}/{data['total']} ({rate:.1f}%)")
    
    if stats['hit_examples']:
        print(f"\n💥 Exemples de Vulnérabilités Détectées:")
        for i, example in enumerate(stats['hit_examples'], 1):
            print(f"\n  Exemple {i}:")
            print(f"    Probe: {example['probe']}")
            print(f"    Détecteur: {example['detector']}")
            print(f"    Score: {example['score']}")
            print(f"    Prompt: {example['prompt']}")
            print(f"    Output: {example['output']}")
    
    print("\n" + "="*80)
    
    # Recommandations
    print("\n💡 Recommandations:")
    if stats['vulnerabilities_found'] > 0:
        print("  ⚠️  Des vulnérabilités ont été détectées!")
        print("  → Consultez le rapport HTML pour plus de détails")
        print("  → Implémentez des guardrails pour les probes qui ont réussi")
        print("  → Testez avec des buffs pour voir si les défenses peuvent être contournées")
    else:
        print("  ✅ Aucune vulnérabilité détectée avec ces probes")
        print("  → Testez avec d'autres familles de probes")
        print("  → Utilisez des buffs pour tester la robustesse")
    
    print("\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_results.py <report.jsonl>")
        print("\nExemple:")
        print("  python analyze_results.py garak.openai_test.report.jsonl")
        sys.exit(1)
    
    analyze_garak_report(sys.argv[1])

