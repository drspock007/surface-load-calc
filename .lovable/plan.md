

# Améliorer la sélection du Base Case dans Sensitivity

## Problème
Actuellement, le bouton "Load Base Case" charge silencieusement le run le plus récent du mode sélectionné. L'utilisateur ne voit pas quels runs sont disponibles et ne peut pas choisir lequel utiliser. Si aucun run n'existe, le message d'erreur n'est pas assez clair non plus.

## Solution
Remplacer le bouton "Load Base Case" par un **Select dropdown** qui liste tous les runs sauvegardés pour le mode sélectionné, avec le nom du calcul et la date. L'utilisateur choisit directement le run qu'il veut utiliser comme base case.

## Changements

### `src/pages/Sensitivity.tsx`
1. Remplacer le bouton `Load Base Case` (lignes 221-227) par un `Select` dropdown :
   - Charger les runs filtrés par mode depuis `storage.getRuns()`
   - Afficher chaque run avec son `calculationName` et sa date (`timestamp`)
   - Si aucun run disponible, afficher un placeholder explicatif : "Aucun calcul — lancez d'abord un calcul Pipeline Track"
   - Au changement de sélection, charger les inputs du run choisi dans `baseInputs`

2. Mettre à jour `handleModeChange` pour rafraîchir la liste des runs disponibles

3. Garder l'encadré `bg-muted` qui affiche les détails du base case sélectionné

### Structure du Select

```text
┌──────────────────────────────────────┐
│ Label: "Base Case"                   │
│ ┌──────────────────────────────────┐ │
│ │ Select a saved run...         ▼  │ │
│ ├──────────────────────────────────┤ │
│ │ "Highway Crossing" — Mar 12     │ │
│ │ "River Xing 24in" — Mar 10      │ │
│ │ "Test Case #3" — Mar 8          │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Détails techniques
- Formatter la date avec `new Date(run.timestamp).toLocaleDateString()`
- Utiliser `run.id` comme valeur du Select (unique)
- Conserver le toast de confirmation quand un base case est chargé
- Si l'utilisateur change de mode et que le base case actuel n'est plus compatible, le réinitialiser

## Fichiers modifiés
| Fichier | Modification |
|---------|-------------|
| `src/pages/Sensitivity.tsx` | Remplacer le bouton par un Select dropdown listant les runs |

