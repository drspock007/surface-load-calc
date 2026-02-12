

# Sauvegarde et chargement des parametres de calcul (Presets)

## Objectif

Permettre a l'utilisateur de sauvegarder ses parametres de calcul sous un nom, puis de les recharger rapidement pour eviter de tout ressaisir a chaque nouveau calcul.

## Fonctionnement

- **Sauvegarder** : Un bouton "Save Preset" a cote du bouton Calculate permet de sauvegarder tous les parametres actuels du formulaire sous un nom choisi par l'utilisateur
- **Charger** : Un menu deroulant "Load Preset" en haut du formulaire (dans la carte "Calculation Name") permet de selectionner un preset sauvegarde et pre-remplir automatiquement tous les champs
- **Supprimer** : Chaque preset peut etre supprime individuellement depuis le menu deroulant
- **Stockage** : Les presets sont sauvegardes dans le localStorage du navigateur, separes par mode de calcul (Track, 2-Axle, 3-Axle, Grid)

## Interface

### Carte "Calculation Name" (haut du formulaire)

Un selecteur "Load Preset" sera ajoute a cote du champ "Name". Quand l'utilisateur selectionne un preset :
- Tous les champs du formulaire sont pre-remplis avec les valeurs sauvegardees
- Le nom du calcul reste editable

### Bas du formulaire (a cote du bouton Calculate)

Un bouton secondaire "Save Preset" ouvre une petite boite de dialogue demandant un nom pour le preset, puis sauvegarde les valeurs actuelles.

## Details techniques

### Nouveau fichier : `src/utils/presetStorage.ts`

Fonctions utilitaires pour gerer les presets dans le localStorage :
- `getPresets(mode)` : recupere la liste des presets pour un mode donne
- `savePreset(mode, name, values)` : sauvegarde un preset (max 20 par mode)
- `deletePreset(mode, name)` : supprime un preset
- Cle localStorage : `surface-loading-presets-{mode}`
- Validation Zod pour la structure des presets

### Nouveau composant : `src/components/PresetManager.tsx`

Composant reutilisable contenant :
- Le selecteur de preset (Select de shadcn/ui)
- Le bouton "Save Preset" avec Dialog pour le nom
- Le bouton de suppression par preset
- Props : `mode`, `onLoad(values)`, `getCurrentValues()`

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/utils/presetStorage.ts` | Nouveau : fonctions CRUD pour les presets |
| `src/components/PresetManager.tsx` | Nouveau : composant UI selecteur + sauvegarde |
| `src/components/PipelineTrackForm/index.tsx` | Ajouter PresetManager, logique load/save |
| `src/components/TwoAxleForm.tsx` | Idem |
| `src/components/ThreeAxleForm.tsx` | Idem |
| `src/components/GridLoadForm.tsx` | Idem |

### Logique de chargement

Quand un preset est charge :
1. Le systeme d'unites du preset est applique en premier
2. Tous les champs sont mis a jour via `setValue()` de react-hook-form
3. Le nom du calcul n'est PAS ecrase (l'utilisateur le choisit lui-meme)

