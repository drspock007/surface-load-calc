# Ajout de la norme canadienne pour l'acier

La norme canadienne équivalente pour les tuyaux de canalisation en acier est **CSA Z245.1 — Steel line pipe** (dimensions et nuances, publiée par la CSA pour les réseaux de transport de pétrole et de gaz). Elle est l'homologue canadien de l'API 5L : les nuances y sont désignées par leur SMYS en MPa (241, 290, 317, 359, 386, 414, 448, 483, 550).

## Ce qui change

1. **Menu Pipe Material**
   - L'option acier devient : `Steel (CSA Z245.1 / ASME B36.10 / API 5L)`
   - Le tooltip précise que les nuances CSA Z245.1 et API 5L sont équivalentes (même SMYS).

2. **Menu Steel Grade**
   - Chaque nuance affiche la double désignation, par exemple :
     - `Grade B / CSA 241` (241 MPa)
     - `X42 / CSA 290`, `X46 / CSA 317`, `X52 / CSA 359`, `X56 / CSA 386`,
       `X60 / CSA 414`, `X65 / CSA 448`, `X70 / CSA 483`, `X80 / CSA 550`
   - Les valeurs SMYS et les identifiants internes des nuances restent inchangés : aucun impact sur les calculs, les presets sauvegardés ou la parité VBA.

3. **Documentation**
   - Mention de CSA Z245.1 comme norme canadienne acier dans le manuel technique (section pipe/matériaux), en parallèle de la CSA B137.4 déjà citée pour le polyéthylène.

4. **Maintenance**
   - Mise à jour du numéro de version en pied de page (vAAAAMMDDHHMMSS, heure de Rome) et de `sitemap.xml`.

## Détails techniques

- `src/domain/pipeline/pipePresets.ts` : ajout d'un champ `csaGrade` (et libellé combiné) sur chaque entrée de `STEEL_GRADES`, sans modifier `grade` ni les SMYS.
- `src/components/PipelineTrackForm/PipeSelector.tsx` : libellé et tooltip de l'option `STEEL`.
- Composant des champs acier (`SteelPipeFields`) : affichage du libellé combiné dans le `Select` des nuances.
- Manuel technique : courte note de norme, sans nouvelle formule.
