

# Aligner l'UI sur pipe-thickness-calculator

## Objectif
Appliquer le meme schema de couleurs (orange `#ff8e04` / noir / blanc) que [pipe-thickness-calculator](/projects/3301ab0b-8f79-4d2e-a602-b38a8477a042) et ajouter le logo Giovanni Malagnino Consulting en haut a gauche avec lien vers le site principal.

## Changements prevus

### 1. Copier le logo (`src/assets/logo.png`)
- Copier l'asset `logo.png` du projet pipe-thickness-calculator vers `src/assets/logo.png` dans ce projet.

### 2. Mettre a jour la palette de couleurs (`src/index.css`)
Remplacer le theme bleu actuel par le theme orange/noir/blanc :
- **primary** : `28 100% 51%` (orange `#ff8e04`)
- **accent** : `28 100% 51%` (meme orange)
- **secondary** : `0 0% 10%` / foreground `0 0% 100%`
- **background** : `0 0% 100%` (blanc)
- **foreground** : `0 0% 0%` (noir)
- **card** : `0 0% 98%`
- Memes ajustements pour le mode dark
- Retirer le `--engineering-gradient` custom (remplace par un gradient orange)
- **ring** : `28 100% 51%`

### 3. Mettre a jour le Tailwind config (`tailwind.config.ts`)
- Aligner les couleurs hardcodees (primary `#ff8e04`, secondary `#000000`, accent `#ff8e04`) comme dans le projet source
- Retirer `backgroundImage.engineering-gradient` et `transitionProperty.smooth`

### 4. Modifier le header dans `Layout.tsx`
- Remplacer l'icone Calculator + texte par le logo PNG avec lien externe vers `https://giovannimalagninoconsulting.com/`
- Garder la navigation intacte a droite
- Style : `<img src={logo} alt="Giovanni Malagnino Consulting" className="h-10 w-auto hover:opacity-80 transition-opacity" />`

### 5. Mettre a jour `Home.tsx`
- Remplacer l'icone gradient par le logo ou ajuster le gradient pour utiliser la couleur orange

### 6. Favicon (`index.html`)
- Pointer le favicon vers le meme que pipe-thickness-calculator : `https://giovannimalagninoconsulting.com/wp-content/uploads/2021/08/logo_2021.png`

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/assets/logo.png` | Copie depuis pipe-thickness-calculator |
| `src/index.css` | Nouvelle palette orange/noir/blanc |
| `tailwind.config.ts` | Couleurs alignees |
| `src/components/Layout.tsx` | Logo + lien externe en haut a gauche |
| `src/pages/Home.tsx` | Ajustement icone/gradient |
| `index.html` | Favicon mis a jour |

## Ce qui ne change PAS
- La structure de navigation (5 onglets)
- Les formulaires de calcul
- La logique metier / domain
- Les composants UI (shadcn)
- Le routing

