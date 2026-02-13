

# Export / Import de Presets en fichier JSON

## Objectif

Permettre aux utilisateurs d'exporter leurs presets dans un fichier JSON portable et d'importer des presets depuis un fichier, pour partager entre collegues ou transferer entre machines.

## Format du fichier

```text
{
  "version": 1,
  "mode": "track",
  "exportedAt": "2026-02-13T...",
  "presets": [
    { "name": "Highway 24in", "values": {...}, "createdAt": "..." }
  ]
}
```

Nom automatique du fichier : `presets-track-2026-02-13.json`

## Comportement

- **Export** : telecharge un fichier `.json` avec tous les presets du mode actif
- **Import** : ouvre un selecteur de fichier, valide le contenu (Zod), verifie que le mode correspond, fusionne avec les presets existants (sans ecraser les doublons par nom), et respecte la limite de 20

## Modifications

### `src/utils/presetStorage.ts`
- Ajouter un schema Zod pour le fichier d'export (`version`, `mode`, `exportedAt`, `presets`)
- Ajouter `exportPresetsToJSON(mode)` : retourne la string JSON formatee
- Ajouter `importPresetsFromJSON(mode, jsonString)` : valide, verifie le mode, fusionne intelligemment, retourne un resultat (nombre importes, nombre ignores)

### `src/components/PresetManager.tsx`
- Ajouter deux boutons : **Export** (icone Download) et **Import** (icone Upload)
- Export : appelle `exportPresetsToJSON`, cree un Blob et declenche le telechargement
- Import : ouvre un `<input type="file" accept=".json">` cache, lit le fichier, appelle `importPresetsFromJSON`, affiche un toast avec le resultat, rafraichit la liste
- Disposition : les deux boutons cote a cote sous le bouton "Save Preset"

## Validation a l'import
- Taille max du fichier : 1 MB
- Schema Zod complet (structure, types, limites de longueur)
- Le champ `mode` doit correspondre au mode actuel (sinon erreur claire)
- Les presets dont le nom existe deja sont ignores (pas ecrases)
- La limite de 20 presets par mode est respectee (les surplus sont ignores avec avertissement)

