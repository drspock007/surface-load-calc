

# Correction du test 2-Axle et investigation de l'ecart longitudinal

## Problemes identifies

### A. Parametres du test completement faux (8 erreurs)

Le test `vba2AxleEngine.test.ts` a ete cree avec des parametres qui ne correspondent pas a l'Excel :

| Parametre | Excel | Test actuel | Correction |
|-----------|-------|-------------|------------|
| Densite sol | 1600 kg/m3 | 1800 | 1600 |
| Profondeur H | 1.6 m | 1.2 | 1.6 |
| Bedding angle | 30 deg | 90 | 30 |
| Axle Width | 2929 mm | 2300 | 2929 |
| Axle Spacing | 4.215 m | 4 | 4.215 |
| Tire Width | 652 mm | 315 | 652 |
| Tire Pressure | 71400 kg/m2 | 8 bar | 71400 kg/m2 |
| Equiv Stress | Von Mises | Tresca | Von Mises |
| E' method | N/A (lookup) | LOOKUP | Conserver LOOKUP |
| Axle 1 tires | Single (2) | Dual (4) | 2 (contact=652=1x652) |
| Axle 2 tires | Dual (4) | Dual (4) | 4 (contact=1304=2x652) |

### B. Ecart longitudinal meme avec bons parametres

La fonction `calculateLongitudinalLiveStress()` dans `sharedCalculations.ts` utilise une discretisation numerique (boucle for avec stepSize) qui peut diverger de la formule analytique exacte du VBA Excel. Les points suspects :

1. **stepSize trop grossier** : `Math.max(1, Lload/50)` pourrait manquer le pic de moment
2. **Formule Wsurf** : `bsnq * 2*PI*H^2/3 * IF` est une approximation du VBA qui merite verification
3. **Distribution Ppipe** : `Wsurf / (PI * Lload^2)` suppose une repartition uniforme

## Plan d'action

### Etape 1 : Corriger le test avec les vrais parametres Excel

Modifier `src/domain/pipeline/__tests__/vba2AxleEngine.test.ts` :
- Corriger tous les 8+ parametres d'entree pour correspondre exactement a l'Excel
- Mettre les valeurs de reference Excel exactes (nouvelles valeurs de l'image) :
  - sigma_H_Live_Zero = 17154 kPa
  - sigma_H_Total_Zero = 23380 kPa
  - sigma_H_Total_MOP = 88888 kPa
  - sigma_L_Live_Zero = 48163 kPa
  - sigma_L_Total_Zero = 207334 kPa
  - sigma_L_Total_MOP = 226958 kPa
  - sigma_E_Zero = 219958 kPa (Von Mises)
  - sigma_E_MOP = 208025 kPa

### Etape 2 : Executer le test et mesurer les ecarts exacts

Lancer le test pour identifier precisement quelles valeurs intermediaires divergent (hoop live, longitudinal live, etc.) et de combien.

### Etape 3 : Affiner le calcul longitudinal si necessaire

Si l'ecart sur sigma_L_Live depasse 10% :
- Reduire le stepSize dans la boucle de moment (ligne 161)
- Verifier la formule Wsurf contre le VBA original
- Comparer la distribution de charge Ppipe avec le VBA

### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/domain/pipeline/__tests__/vba2AxleEngine.test.ts` | Corriger les parametres + valeurs de reference |
| `src/domain/pipeline/sharedCalculations.ts` | Potentiellement affiner la discretisation longitudinale |

