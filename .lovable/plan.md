

# Correction du calcul Boussinesq pour les vehicules 2-Axle et 3-Axle

## Probleme racine

La fonction `generateStandardMeasurementPoints()` dans `boussinesqHelpers.ts` ne mesure la pression qu'a `(0, 0)`, soit le centre du vehicule. Pour un 2-Axle, les essieux sont a `y = +/- axleSpacing/2` (environ 83 pouces de part et d'autre). La pression maximale sur le pipeline se trouve directement sous l'essieu le plus lourd, pas au centre.

Le VBA Excel scanne le long du pipeline pour trouver le maximum. L'app ne mesure qu'en un seul point, d'ou une sous-estimation de ~10-15% de la pression de surface et par consequent du stress longitudinal.

## Plan de correction

### Etape 1 : Modifier `boussinesqHelpers.ts`

Ajouter une nouvelle fonction `generatePipeScanMeasurementPoints()` qui cree un ensemble de points le long de l'axe du pipeline (y variable) pour scanner la pression maximale :

- Scanner de `y = -maxExtent` a `y = +maxExtent` avec un pas fin (par exemple 6 pouces)
- `maxExtent` = la position y de l'essieu le plus eloigne + une marge
- `x` fixe a `laneOffset` (position laterale du pipeline)
- Retourner tous les points pour que `calculateBoussinesqFromPoints` trouve le vrai maximum

### Etape 2 : Modifier `vba2AxleEngine.ts`

Remplacer l'appel a `generateStandardMeasurementPoints(laneOffset, 0)` par la nouvelle fonction de scan, en passant les positions y des essieux pour definir la plage de scan.

Concretement :
- Passer les positions `axle1_Y` et `axle2_Y` pour definir la zone de scan
- Scanner au minimum de `min(axle1_Y, axle2_Y) - marge` a `max(axle1_Y, axle2_Y) + marge`
- Le pas de scan peut etre de 3 a 6 pouces pour un bon compromis precision/performance

### Etape 3 : Modifier `vba3AxleEngine.ts`

Meme correction pour le moteur 3-Axle : scanner le long du pipeline au lieu de mesurer seulement a (0, 0).

### Etape 4 : Corriger le test `vba2AxleEngine.test.ts`

- Changer `SMYS: 359000` en `SMYS: 359` (le formulaire entre en MPa, pas kPa)
- Mettre a jour les valeurs attendues avec les references Excel exactes

### Etape 5 : Valider les resultats

Verifier que les nouvelles valeurs de stress correspondent aux references Excel :
- sigma_H_Total_Zero ~= 23,380 kPa
- sigma_L_Total_Zero ~= 207,334 kPa  
- sigma_L_Total_MOP ~= 226,958 kPa
- sigma_E_Zero ~= 219,958 kPa (Von Mises)

## Details techniques

### Nouvelle fonction dans `boussinesqHelpers.ts`

```text
generatePipeScanMeasurementPoints(
  laneOffset_in: number,
  axlePositions_Y: number[],   // positions Y de chaque essieu
  scanStep_in: number = 6      // pas de scan (pouces)
): MeasurementPoint[]
```

Genere des points de (minY - 2*scanStep) a (maxY + 2*scanStep) le long du pipeline a x = laneOffset_in.

### Impact sur la performance

Le nombre de points de mesure augmente (de 2 a environ 30-50 selon l'espacement des essieux), mais le calcul reste rapide car la boucle Boussinesq est O(pointLoads x measurementPoints).

### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/domain/pipeline/boussinesqHelpers.ts` | Ajouter `generatePipeScanMeasurementPoints()` |
| `src/domain/pipeline/vba2AxleEngine.ts` | Utiliser le scan au lieu de 2 points fixes |
| `src/domain/pipeline/vba3AxleEngine.ts` | Meme correction |
| `src/domain/pipeline/__tests__/vba2AxleEngine.test.ts` | Corriger SMYS et valeurs attendues |

