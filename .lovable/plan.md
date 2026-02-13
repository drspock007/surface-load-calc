
# Afficher la position du maximum de pression dans les unites de l'utilisateur

## Probleme

La position du maximum de pression Boussinesq (`Max Pressure Location`) est toujours affichee en pouces (ex: `y=82"`), meme quand l'utilisateur travaille en SI.

## Solution

### Etape 1 : Ajouter la valeur brute Y dans le resultat Boussinesq

Dans `src/domain/pipeline/boussinesqHelpers.ts` :
- Ajouter `maxY_in: number` au type de retour de `calculateBoussinesqFromPoints`
- Stocker la coordonnee Y brute (en pouces) du point de pression maximale

### Etape 2 : Formater le label dans chaque moteur de calcul

Dans `src/domain/pipeline/vba2AxleEngine.ts` et `vba3AxleEngine.ts` :
- Apres avoir obtenu le resultat Boussinesq, formater `locationMaxLoad` selon le systeme d'unites :
  - EN : `"Pipe scan y=82"` (pouces)
  - SI : `"Pipe scan y=2.08 m"` (conversion pouces vers metres, 1 in = 0.0254 m)

### Etape 3 : Appliquer la meme logique au Grid engine

Dans `src/domain/pipeline/vbaGridEngine.ts`, meme conversion si applicable.

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/domain/pipeline/boussinesqHelpers.ts` | Ajouter `maxY_in` au retour |
| `src/domain/pipeline/vba2AxleEngine.ts` | Formater le label selon unitsSystem |
| `src/domain/pipeline/vba3AxleEngine.ts` | Formater le label selon unitsSystem |
| `src/domain/pipeline/vbaGridEngine.ts` | Formater le label selon unitsSystem (si applicable) |
