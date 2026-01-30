

# Plan de correction : Alignement des calculs 2-Axle avec Excel VBA

## Probleme identifie

En comparant avec Excel VBA, la difference majeure est dans l'interpretation de "Contact Width":

| Aspect | Excel VBA | Notre application |
|--------|-----------|-------------------|
| Entree utilisateur | Largeur totale par cote | Largeur d'un pneu |
| Calcul automatique | Aucun | × 2 pour Dual |
| Axle 1 (Single) | 652mm | 315mm entree → 315mm utilise |
| Axle 2 (Dual) | 1304mm | 315mm entree → 630mm utilise |

Le code actuel (vba2AxleEngine.ts lignes 136-137) fait:
```typescript
const axle1WidthPerSide = (inputs.axle1TiresPerAxle || 2) === 4 
  ? axle1TireWidth_in * 2 
  : axle1TireWidth_in;
```

Ceci est correct SI l'utilisateur entre la largeur d'un seul pneu. Mais il faut clarifier l'interface.

## Changements proposes

### 1. Renommer les labels dans le formulaire

Modifier `TwoAxleForm.tsx` et `ThreeAxleForm.tsx` pour clarifier:

**Avant:**
- "Tire Width"
- "Tires Per Axle: 2 (Single) / 4 (Dual)"

**Apres:**
- "Single Tire Width" (largeur d'un pneu individuel)
- "Tire Config: Single / Dual (jumelés)"

### 2. Ajouter une indication visuelle

Afficher la largeur de contact totale par cote calculee:
```text
Largeur totale par cote: 630mm (315mm × 2 pneus)
```

### 3. Mettre a jour le diagramme

Modifier `TwoAxleDiagram.tsx` pour afficher:
- La largeur d'un pneu ET la largeur totale par cote
- Visualiser les pneus jumeles (Dual) comme 2 rectangles au lieu d'un seul

### 4. Verification des calculs

Confirmer que la geometrie Boussinesq est correcte:
- 2 grilles par axe (gauche + droite)
- Chaque grille a la largeur totale par cote (tireWidth × nombre de pneus par cote)
- Chaque grille recoit la moitie de la charge de l'axe

## Fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| `src/components/TwoAxleForm.tsx` | Renommer labels, ajouter affichage largeur totale |
| `src/components/ThreeAxleForm.tsx` | Idem pour 3-Axle |
| `src/components/TwoAxleDiagram.tsx` | Afficher largeur totale, visualiser Dual |
| `src/components/ThreeAxleDiagram.tsx` | Idem pour 3-Axle |

## Resultat attendu

Apres ces modifications:
- L'utilisateur comprend clairement qu'il entre la largeur d'UN pneu
- L'application calcule automatiquement la largeur totale par cote
- Les resultats doivent correspondre a Excel si les memes dimensions totales sont utilisees
- Pour reproduire exactement Excel: entrer 652mm avec "Single" pour Axle 1, et 652mm avec "Dual" pour Axle 2 (qui donnera 1304mm total)

