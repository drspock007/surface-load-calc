# Tuyaux polyéthylène (CSA B137.4) dans le calculateur

Ajout d'un sélecteur de matériau **Acier / Polyéthylène (PE)** dans les quatre modes d'analyse (Track, 2-Axle, 3-Axle, Grid). L'acier conserve strictement le comportement CEPA actuel ; le PE active un jeu de dimensions, de propriétés et de vérifications propre aux tuyaux flexibles.

## Ce que l'utilisateur verra

Dans le bloc « Pipe » de chaque formulaire :

1. Nouveau choix **Pipe Material** : Steel (défaut, comportement inchangé) ou Polyethylene (CSA B137.4).
2. En mode PE, les sélecteurs changent :
   - **Nominal size** : tailles CTS/IPS de CSA B137.4
   - **Dimension Ratio (DR)** : DR 7.3, 9, 9.3, 11, 13.5, 15.5, 17, 21, 26 (épaisseur = OD / DR, calculée automatiquement)
   - **Material designation** : PE2708 et PE4710 (liste extensible, plus une option Custom prévue pour la suite)
   - **Elastic modulus** : court terme (charges roulantes) ou long terme (charge de sol), valeurs par défaut par désignation, éditables
   - Le champ SMYS est remplacé par la **HDB / contrainte admissible** en MPa (ou psi en unités impériales)
3. Le bloc Results affiche pour le PE quatre vérifications au lieu des contraintes acier :
   - **Déflexion en anneau** (Iowa modifiée) en % du diamètre, limite par défaut 5 % (modifiable)
   - **Déformation de flexion de paroi** vs limite admissible (5 % par défaut)
   - **Contrainte circonférentielle vs pression admissible** (HDB, DR, facteur de service, facteur de température)
   - **Voilement (buckling)** : pression critique vs pression appliquée (sol + charge vive), avec facteur de sécurité affiché

Chaque vérification garde le format PASS/FAIL déjà utilisé, avec la marge en %.

## Détails techniques

### Domaine

- `src/domain/pipeline/types.ts` : ajouter `PipeMaterial = 'STEEL' | 'PE'`, les champs PE optionnels (`peDesignation`, `dimensionRatio`, `peModulusMode`, `peModulus`, `peHDB`, `peDeflectionLimitPct`, `peStrainLimitPct`) et un bloc `peResults` dans les résultats. Idem pour `types2Axle`, `types3Axle`, `typesGrid` qui étendent ce socle.
- Nouveau `src/domain/pipeline/pePresets.ts` (~150 lignes) : tailles CSA B137.4, DR standards, propriétés PE2708 / PE4710 (HDB, modules court/long terme, facteur de service, facteurs de température).
- Nouveau `src/domain/pipeline/peChecks.ts` (~150 lignes) : les quatre vérifications
  - déflexion Iowa : `Δy/D = (DL·Kb·(Wsoil + Wlive)·r³) / (E·I + 0.061·E'·r³)`
  - déformation de flexion : `ε = (Δy/D)·(t/D)·facteur de forme`
  - pression admissible : `P = 2·HDB·FS·Ft / (DR − 1)`
  - voilement : formule de Luscher/AWWA avec E' et profondeur d'enfouissement
- Nouveau `src/domain/pipeline/peEngine.ts` (~120 lignes) : reçoit la pression de surface Boussinesq et la charge de sol déjà produites par les moteurs existants, puis applique les vérifications PE. Aucun changement aux calculs Boussinesq, impact factor, E' ou charge de sol — ils sont partagés.
- Les moteurs `vba*Engine.ts` reçoivent un aiguillage en fin de chaîne : si `pipeMaterial === 'PE'`, on remplace le bloc contraintes acier (Spangler + Tresca + % SMYS) par le résultat PE. Le module `E = 30e6 psi` codé en dur devient un paramètre pour ne pas dupliquer les formules.

### Interface

- `PipeSelector.tsx` (198 lignes, déjà à la limite) sera scindé en `PipeMaterialSelector.tsx`, `SteelPipeFields.tsx` et `PePipeFields.tsx`, chacun sous 150 lignes.
- Les valeurs par défaut PE (CTS 4", DR 11, PE4710, module court terme) rejoignent les défauts existants ; les schémas Zod des presets sont étendus de manière rétrocompatible (les presets acier existants restent valides et sont lus comme `STEEL`).
- Nouveau `src/components/results/PeChecksCard.tsx` pour l'affichage des quatre vérifications, branché dans `Results.tsx` selon le matériau.
- Tooltips ajoutés sur DR, HDB, module court/long terme, limites de déflexion et de déformation.

### Tests et documentation

- Test Vitest `peChecks.test.ts` : un cas de référence PE4710 DR11 avec déflexion, déformation, pression admissible et voilement vérifiés à la main.
- Section « Polyethylene pipe (CSA B137.4) » ajoutée au Technical Reference Manual avec les quatre formules en KaTeX, citant CSA B137.4 et le CEPA Surface Loading Calculator pour la partie charges.
- Version du pied de page et `sitemap.xml` mis à jour à l'heure de Rome.

## Hypothèses à valider pendant l'implémentation

Les valeurs numériques de HDB, modules et facteurs de service seront centralisées dans `pePresets.ts` avec leur source en commentaire, pour que tu puisses les ajuster facilement après revue.
