

# Test unitaire Vitest pour le moteur 2-Axle (comparaison Excel)

## Objectif

Creer un fichier de test `src/domain/pipeline/__tests__/vba2AxleEngine.test.ts` qui valide le moteur 2-Axle contre les valeurs de reference Excel fournies dans la capture d'ecran.

## Parametres du test (d'apres l'image Excel)

- **Pipe** : D=114.3 mm, t=6.02 mm, MOP=7070 kPa, SMYS=359 MPa, deltaT=65 C
- **Sol** : densite=1800 kg/m3, H=1.2 m, bedding=90 deg, methode Prism, friction=30 deg
- **E'** : Lookup, Coarse with fines, 90% compaction
- **Vehicle** : Farm (IF=1.25), 2 essieux
  - Axle 1 : 36000 kg (front)
  - Axle 2 : 67000 kg (rear)
  - Axle Spacing : ~4 m
  - Tire Width : 315 mm, mode AUTO, pression ~8 bar
  - Axle Width : 2300 mm, lane offset : 0
- **Analyse** : Flexible pavement, Tresca, CSA Z662

## Valeurs de reference Excel

| Grandeur | Valeur attendue |
|----------|----------------|
| sigma_H_Total_Zero | ~32 100 kPa |
| sigma_L_Total_Zero | ~239 161 kPa |
| sigma_E_Zero (Tresca) | ~271 261 kPa |

## Structure du test

Le test suivra le meme patron que `vba3AxleEngine.test.ts` :

1. Definition des inputs SI
2. Appel de `calculate2AxleVehicleVBA(inputs)`
3. Les resultats sont deja en kPa (car `unitsSystem: 'SI'`)
4. Comparaison avec tolerance de 10% (pour tenir compte des differences d'interpolation et de discretisation Boussinesq)
5. Verification de la structure des resultats et des valeurs debug

## Fichier a creer

`src/domain/pipeline/__tests__/vba2AxleEngine.test.ts`

**Note** : Certains parametres (nombre de pneus par essieu, espacement exact, etc.) devront peut-etre etre ajustes apres un premier run du test si les ecarts sont trop importants. Le test servira aussi de base pour investiguer les differences eventuelles.

