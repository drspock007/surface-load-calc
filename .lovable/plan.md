

# Module "Rayon de Courbure Minimal" (Minimum Bend Radius)

## Concept

Apres le calcul CEPA standard, le module determine la marge residuelle en contrainte longitudinale et en deduit le rayon de courbure minimal que le tuyau peut supporter sans depasser les limites admissibles.

### Formule

La contrainte de flexion due a la courbure est :

```text
sigma_bend = E * D / (2 * R)
```

Donc le rayon minimal est :

```text
R_min = E * D / (2 * sigma_remaining)
```

Ou `sigma_remaining` est la marge disponible en contrainte longitudinale :

```text
sigma_remaining = sigma_allowable - sigma_long_existing
```

Le calcul sera fait pour les deux conditions (Zero Pressure et MOP), et le R_min le plus conservateur sera retenu. Le resultat sera presente en horizontal et vertical (memes valeurs physiquement, mais distinction utile pour l'utilisateur).

## Interface Utilisateur

### Sur le formulaire (Calculator)

- Un **Switch** "Enable Bend Radius Analysis" dans la section Analysis Parameters de chaque formulaire (Track, 2-Axle, 3-Axle, Grid)
- Pas de champs supplementaires : le calcul utilise uniquement les donnees deja saisies

### Sur la page Results

- Une nouvelle **Card** "Minimum Bend Radius" affichee uniquement si le switch est active
- Contenu :
  - R_min horizontal et vertical (en ft / m selon le systeme d'unites)
  - Marge residuelle en contrainte longitudinale (psi / kPa)
  - Condition determinante (Zero Pressure ou MOP)
  - Indication Pass/Fail : si la marge est negative, le tuyau est deja en depassement sans courbure

## Fichiers a Modifier

| Fichier | Modification |
|---------|-------------|
| `src/domain/pipeline/types.ts` | Ajouter `enableBendRadius: boolean` dans `PipelineTrackInputs` et `BendRadiusResults` dans les types de resultats |
| `src/domain/pipeline/types2Axle.ts` | Idem pour `TwoAxleInputs` |
| `src/domain/pipeline/types3Axle.ts` | Idem pour `ThreeAxleInputs` |
| `src/domain/pipeline/typesGrid.ts` | Idem pour `GridLoadInputs` |
| `src/domain/pipeline/bendRadiusCalculation.ts` | **Nouveau fichier** : fonction `calculateMinBendRadius()` |
| `src/domain/pipeline/vbaTrackEngine.ts` | Appeler le calcul de bend radius si active |
| `src/domain/pipeline/vba2AxleEngine.ts` | Idem |
| `src/domain/pipeline/vba3AxleEngine.ts` | Idem |
| `src/domain/pipeline/vbaGridEngine.ts` | Idem |
| `src/components/AnalysisParametersSection.tsx` | Ajouter le Switch "Bend Radius Analysis" |
| `src/components/PipelineTrackForm/index.tsx` | Ajouter le champ au schema et le passer |
| `src/components/TwoAxleForm.tsx` | Idem |
| `src/components/ThreeAxleForm.tsx` | Idem |
| `src/components/GridLoadForm.tsx` | Idem |
| `src/pages/Results.tsx` | Afficher la Card "Minimum Bend Radius" si les resultats existent |

## Details Techniques

### Nouveau fichier `bendRadiusCalculation.ts`

```text
Entrees :
  - D (diametre exterieur, inches)
  - sigma_long_high_zero (contrainte longitudinale haute @ zero pressure)
  - sigma_long_high_mop (contrainte longitudinale haute @ MOP)
  - sigma_allowable_long (limite admissible longitudinale en psi)
  - unitsSystem (EN ou SI)

Sorties :
  - R_min_ft (rayon minimal en ft ou m)
  - sigma_remaining_psi (marge residuelle)
  - governingCondition ("Zero Pressure" ou "MOP")
  - hasMargin (boolean : true si marge > 0)
```

### Logique

1. Calculer la marge pour chaque condition :
   - `margin_zero = allowable - longHighZero`
   - `margin_mop = allowable - longHighMOP`
2. Prendre la marge la plus petite (condition la plus contraignante)
3. Si marge <= 0 : pas de courbure possible, retourner `hasMargin = false`
4. Sinon : `R_min = E * D / (2 * margin)`, convertir en ft puis en m si SI

### Affichage Results

Nouvelle Card entre "Stress Analysis" et "Pass/Fail Summary" :

```text
Minimum Bend Radius
-------------------
Governing Condition: [MOP / Zero Pressure]
Remaining Long. Margin: [xxx] psi/kPa
Min. Horizontal Radius: [xxx] ft/m
Min. Vertical Radius:   [xxx] ft/m

[Warning si hasMargin = false]
"Pipe is already at or beyond longitudinal stress limits
 without any curvature. No bend is permissible."
```

