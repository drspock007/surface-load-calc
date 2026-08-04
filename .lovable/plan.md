# Presets fiabilisés : bibliothèque locale robuste

Objectif : garder le stockage 100 % local (aucun compte), mais rendre les presets fiables, visibles et transportables d'un appareil à l'autre par fichier.

## Ce qui change pour l'utilisateur

1. **Plus de presets qui disparaissent**
   - La liste est relue depuis le stockage à chaque ouverture du sélecteur et synchronisée entre les onglets/formulaires, au lieu d'être figée au premier rendu.
   - Si l'écriture locale échoue (mode privé, quota plein, stockage bloqué), un message d'erreur explicite s'affiche au lieu d'un faux « Preset enregistré ».
   - Vérification après écriture : on relit ce qui a été stocké et on ne confirme que si la sauvegarde est réellement présente.

2. **Une vraie gestion des presets**
   - Un bouton « Presets » ouvre une fenêtre de gestion listant tous les presets du mode courant : nom, date de création, date de dernière modification, aperçu de quelques paramètres clés (diamètre, épaisseur, profondeur, véhicule).
   - Actions par preset : charger, renommer, dupliquer, écraser avec les valeurs actuelles, supprimer (avec confirmation).
   - Champ de recherche par nom, tri par nom ou par date.
   - Sauvegarde d'un nom déjà existant : demande explicite « écraser ou créer une copie ? » au lieu d'un écrasement silencieux.

3. **Transport entre appareils sans compte**
   - Export : soit le mode courant, soit **tous les modes en un seul fichier** (« Exporter tout »).
   - Import : détection automatique du contenu du fichier, aperçu de ce qui va être importé, et choix en cas de conflit de nom (ignorer / renommer automatiquement / remplacer).
   - Le fichier reste un JSON versionné, lisible et archivable.

4. **Sécurité des données existantes**
   - Les presets déjà enregistrés sont conservés et migrés automatiquement au nouveau format (ajout des dates manquantes), sans perte.

## Détails techniques

- `src/utils/presetStorage.ts` : passage à un format versionné `{ schemaVersion, presets[] }` avec migration depuis le format tableau actuel ; ajout de `updatedAt`, `mode`, et d'un `id` stable ; retour d'un résultat typé `{ ok, error }` au lieu d'un booléen ; helpers `renamePreset`, `duplicatePreset`, `overwritePreset`, `exportAll`, `importAuto`. Fichier découpé en `presetStorage/schema.ts`, `presetStorage/crud.ts`, `presetStorage/transfer.ts` pour rester sous 150-180 lignes par fichier.
- Nouveau hook `src/hooks/usePresets.ts` : source de vérité unique, rafraîchissement à l'ouverture, écoute de l'évènement `storage` pour la synchro multi-onglets.
- `src/components/PresetManager.tsx` réduit à la barre d'actions ; la fenêtre de gestion, la liste et les dialogues de conflit vivent dans `src/components/presets/` (`PresetLibraryDialog.tsx`, `PresetRow.tsx`, `PresetConflictDialog.tsx`, `PresetImportPreview.tsx`).
- Aucun changement dans les moteurs de calcul ni dans les schémas Zod des formulaires ; l'API `mode` / `getCurrentValues` / `onLoad` reste identique, donc les 4 formulaires (Track, 2-Axle, 3-Axle, Grid) ne changent pas ou peu.
- Interface responsive (mobile, tablette, desktop) et version du pied de page mise à jour.
