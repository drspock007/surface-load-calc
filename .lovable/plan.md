

# Titre et description du site

## Changements

Mise a jour du titre et de la description dans deux fichiers pour refleter explicitement le contexte CEPA et tuyaux enterres.

### Titre propose (max 60 caracteres)
**CEPA Buried Pipeline Surface Loading Calculator** (49 caracteres)

### Description proposee (max 160 caracteres)
**Assess stress on buried pipelines from surface vehicle and equipment loads using CEPA methodology. Supports track, axle, and grid load configurations.** (155 caracteres)

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `index.html` | Mettre a jour `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta name="twitter:card">` |
| `src/pages/Home.tsx` | Mettre a jour le `<h1>` et le paragraphe de description sur la page d'accueil pour correspondre |

## Detail des changements

### `index.html`
- `<title>` : "CEPA Buried Pipeline Surface Loading Calculator"
- `<meta description>` : "Assess stress on buried pipelines from surface vehicle and equipment loads using CEPA methodology. Supports track, axle, and grid load configurations."
- Memes valeurs pour les balises Open Graph (`og:title`, `og:description`)

### `src/pages/Home.tsx`
- `<h1>` : "CEPA Buried Pipeline Surface Loading Calculator"
- Paragraphe descriptif : "Evaluate the impact of surface vehicle and equipment loads on buried pipelines using the CEPA methodology. Analyze contact pressure, Boussinesq stress distribution, and combined stress conditions for track vehicles, wheeled axles, and grid loads."

