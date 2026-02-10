

# Correction du calcul longitudinal : 2 bugs critiques

## Problemes identifies

### Bug 1 : Impact Factor double-compte

Dans `vba2AxleEngine.ts`, le Boussinesq est multiplie par l'impact factor AVANT d'etre passe a la fonction :

```text
BsnqIF = boussinesq.maxPressure_psi * impactFactorDepth   (ligne 199)
```

Puis dans `sharedCalculations.ts`, la fonction multiplie ENCORE par l'impact factor :

```text
Wsurf = Plive_psi * 2 * PI * H_in^2 / 3 * impactFactor   (ligne 143)
```

Resultat : l'impact factor est applique **deux fois**, gonflant artificiellement le stress longitudinal.

Dans le VBA Track engine (correct), le Boussinesq brut est passe et l'impact factor n'est applique qu'une seule fois.

### Bug 2 : Formule du moment de flexion incorrecte

La formule du moment dans `sharedCalculations.ts` est une version simplifiee incorrecte :

```text
M = (Ppipe * Lload^2 / (2*Lambda)) * (exp(-Lambda*x)*(cos-sin) + 1)
```

Le VBA original utilise une formule beam-on-elastic-foundation avec deux cas distincts :

- **Dans la zone de charge** (|x| <= Lload) : M = M1 + M2 (avec M2 = -Ppipe*x^2/2)
- **Hors de la zone de charge** (|x| > Lload) : M = M1 + M2 (superposition de deux termes exponentiels)

Et il suit Mmax, Mmin1 (dans la zone), et Mmin2 (hors zone) separement.

## Correction proposee

Remplacer la fonction `calculateLongitudinalLiveStress` dans `sharedCalculations.ts` par un port exact de la version VBA de `vbaTrackEngine.ts`.

### Changements cles

1. **Signature de la fonction** : changer l'ordre des parametres pour correspondre au VBA Track engine, et passer le Boussinesq brut (sans impact factor) + impact factor separement

2. **Formule du moment** : porter exactement la logique VBA avec les deux cas (inside/outside load region) et le suivi Mmax/Mmin1/Mmin2

3. **Appels dans les engines** : modifier `vba2AxleEngine.ts`, `vba3AxleEngine.ts`, et `vbaGridEngine.ts` pour passer le Boussinesq brut au lieu de BsnqIF

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/domain/pipeline/sharedCalculations.ts` | Remplacer `calculateLongitudinalLiveStress` par le port VBA exact |
| `src/domain/pipeline/vba2AxleEngine.ts` | Passer `boussinesq.maxPressure_psi` au lieu de `BsnqIF` |
| `src/domain/pipeline/vba3AxleEngine.ts` | Idem |
| `src/domain/pipeline/vbaGridEngine.ts` | Idem |

### Impact attendu

Le stress longitudinal devrait diminuer significativement et s'aligner avec les valeurs Excel (sigma_L_Total_Zero ~ 239161 kPa au lieu d'une valeur trop elevee). Le calcul passera alors le code check CSA Z662-2011.

