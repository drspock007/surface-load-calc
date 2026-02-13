

# Correction de l'unite de Soil Density

## Probleme

Sur la page Results, la densite du sol affiche **kN/m³** au lieu de **kg/m³** pour le systeme SI. La valeur 1600 correspond bien a des kg/m³ (densite massique), pas a des kN/m³ (poids volumique).

## Correction

Un seul changement dans `src/components/InputParametersCard.tsx`, ligne 17 :

- **Avant** : `density: system === 'EN' ? 'pcf' : 'kN/m³'`
- **Apres** : `density: system === 'EN' ? 'pcf' : 'kg/m³'`

Aussi verifier `src/pages/Results.tsx` ligne 114 qui utilise un affichage legacy en dur avec `kN/m³` - a corriger egalement en `kg/m³`.

