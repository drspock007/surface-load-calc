

# Plan de Vérification : Alignement des Calculs avec le Manuel CEPA

## Résumé de l'Analyse

Après examen approfondi du manuel CEPA Kiefner 2014 et du code source de l'application, j'ai identifié les points suivants :

### Points de Validation Positifs

| Aspect | État | Observation |
|--------|------|-------------|
| Formule de Boussinesq (Eq. 1) | ✅ Conforme | Σ(3·F)/(2π·H²·(1+(d/H)²)^2.5) |
| Formule de charge du sol (Eq. 2) | ✅ Conforme | Prism: ρ·H/144 psi |
| Formule CEPA Hoop Stress (Eq. 3-4) | ✅ Conforme | Dénominateur avec Kz et E' |
| Formule Hoop Interne (Eq. 5) | ✅ Conforme | P·D/(2·t) |
| Contrainte locale longitudinale (Eq. 8-9) | ✅ Conforme | 0.153·β⁴·σH_live |
| Contrainte équivalente Tresca (Eq. 14) | ✅ Conforme | max(σH, σL, σH-σL) |
| Table E' (CEPA Table 2-3) | ✅ Conforme | Lookup par profondeur et compaction |
| Tests unitaires Example 2 | ✅ Passent | Tolérance 5% |

### Incohérence Critique Détectée

**Paramètre Theta dans calculateBeddingParams()** :

Il existe **deux implémentations différentes** de cette fonction :

| Fichier | Theta pour bedding angle 30° |
|---------|------------------------------|
| `vbaTrackEngine.ts` | 130 |
| `sharedCalculations.ts` | 30 |

Le fichier `sharedCalculations.ts` (utilisé par 2-Axle, 3-Axle, et Grid) utilise Theta = bedding angle directement, tandis que `vbaTrackEngine.ts` utilise une correspondance différente (Theta = 180° - bedding angle approximativement).

**Impact** : Cette différence affecte le calcul du moment de flexion longitudinal (Eq. 10-12) via le paramètre Lambda :

```
λ = ⁴√(E'·D·θ / (360·4·E·I))
```

### Validation avec les Exemples CEPA

**Exemple 2 (Track Vehicle)** - Résultats attendus du manuel :
- σH_Live @ Zero = 2032 psi
- σH_Total @ Zero = 5691 psi  
- σL_Total @ Zero = 6971 psi
- σE @ Zero = 12662 psi
- Impact Factor = 1.45

**Exemple 1 (3-Axle Wheel Vehicle)** - Résultats attendus :
- σH_Live @ Zero = 1708 psi
- σH_Total @ Zero = 5367 psi
- σL_Total @ Zero = 6656 psi  
- σE @ Zero = 12023 psi
- Impact Factor = 1.20

### Définition de Contact Width (Clarifiée par le manuel)

Le manuel CEPA spécifie clairement (page 10-11) :

> "**Contact Width** – enter the ground contact width of a tire. **If dual tires exist, treat them as one tire and enter the overall ground contact width of both tires, including the space between the tires.**"

Cela confirme que l'Excel attend la **largeur totale par côté** (y compris l'espace entre les pneus jumelés), et non la largeur d'un seul pneu.

## Corrections Recommandées

### 1. Harmoniser le calcul de Theta

Déterminer quelle version est correcte en comparant avec le VBA original Excel, puis unifier les deux fichiers. La version de `vbaTrackEngine.ts` est probablement correcte car les tests passent pour Example 2.

### 2. Mettre à jour sharedCalculations.ts

```typescript
// Corriger pour correspondre à vbaTrackEngine.ts
case 0: return { Kb: 0.294, Kz: 0.110, Theta: 135 };
case 30: return { Kb: 0.235, Kz: 0.108, Theta: 130 };
case 60: return { Kb: 0.189, Kz: 0.103, Theta: 120 };
case 90: return { Kb: 0.157, Kz: 0.096, Theta: 105 };
case 120: return { Kb: 0.138, Kz: 0.089, Theta: 90 };
case 150: return { Kb: 0.128, Kz: 0.085, Theta: 75 };
case 180: return { Kb: 0.125, Kz: 0.083, Theta: 60 };
```

### 3. Ajouter des Tests pour l'Exemple 1 (3-Axle)

Créer `vba3AxleEngine.test.ts` avec les valeurs de l'Exemple 1 CEPA pour valider les calculs 3-Axle.

### 4. Ajuster l'interprétation de Contact Width

Comme les récentes modifications UI ont clarifié que l'utilisateur entre la "Single Tire Width" et que l'application calcule la "Contact Width/Side", vérifier que la logique de multiplication est correcte :

```typescript
// Pour Dual (4 pneus par axe) : widthPerSide = singleTireWidth * 2
// Pour Single (2 pneus par axe) : widthPerSide = singleTireWidth
```

## Fichiers à Modifier

| Fichier | Modification |
|---------|--------------|
| `src/domain/pipeline/sharedCalculations.ts` | Corriger les valeurs Theta |
| `src/domain/pipeline/__tests__/vba3AxleEngine.test.ts` | Ajouter tests Example 1 |

## Prochaines Étapes

1. **Confirmer avec l'Excel VBA** : Vérifier les valeurs exactes de Theta utilisées dans le VBA original
2. **Appliquer les corrections** : Unifier les paramètres de bedding
3. **Valider avec Example 1** : S'assurer que les calculs 3-Axle correspondent au manuel

