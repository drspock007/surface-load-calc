

# Ajouter les divisions X et Y au diagramme Grid Load

## Ce qui change

Le rectangle de la grille affichera des **lignes internes** representant les subdivisions en X et Y, montrant visuellement comment la zone chargee est decoupee en sous-cellules pour le calcul Boussinesq.

## Rendu visuel

```text
      Grid Width
    |<--------->|
    +--+--+--+--+   ---
    |  |  |  |  |    |
    +--+--+--+--+    | Grid Length
    |  |  |  |  |    |
    +--+--+--+--+   ---
```

Les lignes internes sont fines et semi-transparentes pour ne pas surcharger le dessin. Un petit label "10 x 10" (ou les valeurs actuelles) est affiche dans un coin du rectangle.

## Modification

### `src/components/GridLoadDiagram.tsx`

**Props ajoutees :** `gridDivisionsX` et `gridDivisionsY` (type `number`)

**Rendu :**
- Lignes verticales internes : `nX - 1` lignes espacees regulierement dans le rectangle
- Lignes horizontales internes : `nY - 1` lignes espacees regulierement
- Style : trait fin (0.5px), couleur foreground a ~20% opacite, pour rester discret
- Label compact en bas a droite du rectangle : `{nX} x {nY}` dans un petit pill

### `src/components/GridLoadForm.tsx`

Ajouter les deux props supplementaires dans l'appel au composant :
```
gridDivisionsX={watch("gridDivisionsX")}
gridDivisionsY={watch("gridDivisionsY")}
```

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/GridLoadDiagram.tsx` | Ajouter props `gridDivisionsX/Y`, dessiner les lignes internes + label |
| `src/components/GridLoadForm.tsx` | Passer les deux nouvelles props au composant |

