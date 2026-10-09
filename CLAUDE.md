# CLAUDE.md — Web app de révision BA3

## Objectif

Ce dépôt contient les ressources de mes cours de BA3 à l'EPFL, rangées par semaine.
On construit une **web app mobile-first** (PWA, installable sur téléphone, utilisable hors ligne)
pour réviser ces cours de manière agréable : fiches par semaine, puis quiz.

L'app est uniquement pour mon usage personnel : pas de backend, pas de comptes.

## Règles absolues

1. **Ne jamais modifier, déplacer ni supprimer les fichiers sources des cours.** Ils sont en lecture seule.
2. **Ne jamais inventer de contenu.** Chaque formule, théorème, syntaxe ou réponse de quiz doit venir
   des sources du dépôt. En cas de doute (scan illisible, notation ambiguë), on ne devine pas :
   on remplit le champ `incertain` (voir le schéma) avec une explication.
3. **Toujours citer la source** (fichier + page / slide / section) dans chaque fiche et chaque question.
4. **Respecter les notations du cours**, même si une autre notation est plus courante ailleurs.
5. **Énoncer les théorèmes avec toutes leurs hypothèses.** Un théorème sans ses hypothèses est faux.
6. Le contenu est rédigé **en français**, sauf si le cours lui-même est en anglais
   (dans ce cas, on garde les termes techniques du cours).
7. On travaille **un cours et une semaine à la fois**. Après chaque génération, on lance
   `npm run validate` puis `npm run build`, et on s'arrête pour que je relise.
8. Avant tout changement important (nouvelle fonctionnalité, refactor, changement de schéma),
   proposer un plan et attendre ma validation.

## Structure du dépôt

Correspondance entre les identifiants des cours et les dossiers sources :

| Slug        | Cours                         | Dossier source            | Organisation des sources |
|-------------|-------------------------------|---------------------------|--------------------------|
| `algebra`   | MATH-310 Algebra              | `algebra/`                | Polycop `algebra/Algebra.pdf` + un PDF par semaine dans `semaine-XX/` (`alg1`…`alg4`). Pas de `semaine-03/` (jour férié) : le PDF de la semaine 4 est `alg3`. |
| `analyse3`  | MATH-203 Analyse III          | `analyse_III/`            | Polycop `analyse_III/main.pdf` + 2 cours par semaine dans `semaine-XX/` (`lecture_XX_Wed`, `lecture_XX_Thu` ; en semaine 1 : `lecture_01_01` et `lecture_01_Thu`). |
| `probastat` | MATH-232 Probabilités et stat | `proba_stat/`             | `semaine-XX/img.png` : screenshot des numéros d'exercices. Polycop `proba_stat/Proba_Stats_IC_20260824 (1).pdf` (en anglais), qui contient aussi les exercices. |
| `softcons`  | CS-214 Software Construction  | `software_construction/`  | Par semaine dans `semaine-XX/` : `swc-weekN` (cours) + `[CS-214 WXX SE] …` (slides SE) ; la semaine 3 n'a que `swc-week3`. |
| `comparch`  | CS-200 Computer Architecture  | `computer_architecture/`  | 1 à 2 PDF de slides par semaine dans `semaine-XX/` : 1a–1e (Instruction Set Architecture), puis 2a–2d (Processor, IOs, and Exceptions). |

Les noms de fichiers sources gardent leurs suffixes de téléchargement (` (1)`, ` (2)`…) :
on les cite tels quels dans `source.fichier`, sans jamais les renommer.

Organisation du code de l'app (à créer, sans jamais mélanger avec les sources) :

```
app/                  # code de la web app
content/              # contenu généré, un fichier par cours et par semaine
  analyse3/semaine-01.yaml
  comparch/semaine-01.yaml
  probastat/mapping.yaml
  ...
scripts/validate.ts   # validation du contenu selon le schéma
```

## Stack technique

- Vite + React + TypeScript
- KaTeX pour les formules (rendu de `$...$` et `$$...$$` dans le Markdown des fiches)
- Shiki pour la coloration syntaxique (langage de Soft Cons, assembleur RISC-V, Verilog/SystemVerilog)
- PWA (vite-plugin-pwa) : installable, fonctionne hors ligne
- Zod pour le schéma du contenu (`app/src/content/schema.ts`), utilisé à la fois par le build de l'app
  et par `scripts/validate.ts`
- **Rendu au build** : le YAML est validé puis converti en HTML (Markdown + KaTeX + Shiki) par un plugin
  Vite (`app/src/content/render.ts`). Le navigateur ne charge ni Zod, ni markdown-it, ni KaTeX JS, ni Shiki ;
  un contenu invalide fait échouer le build. Chaque semaine est un fichier chargé à la demande.
- Progression, scores et favoris dans `localStorage`, avec des clés versionnées (`rev:v1:...`)
- Pas de backend, pas de librairie UI lourde

Commandes :
- `npm run dev` : serveur de développement
- `npm run build` : build de production
- `npm run validate` : vérifie que tous les fichiers de `content/` respectent le schéma

## Format du contenu

Le contenu est écrit en **YAML**. Ce choix permet d'écrire du LaTeX dans des blocs `|`
sans échapper les backslashes, contrairement au JSON.
Les champs texte sont du Markdown, avec du LaTeX via KaTeX.

### Fichier de semaine

```yaml
cours: analyse3
semaine: 1
titre: "Intégrales curvilignes"
fiches:
  - id: analyse3-s01-001          # unique, stable, ne jamais réutiliser un id
    type: theoreme                # voir les types ci-dessous
    titre: "Théorème de Green"
    importance: 3                 # 1 = détail, 2 = utile, 3 = incontournable
    hypotheses: |
      $D \subset \mathbb{R}^2$ domaine régulier, $\partial D$ orienté positivement,
      $F = (P, Q)$ de classe $C^1$ sur un ouvert contenant $\bar D$.
    corps: |
      $$\oint_{\partial D} P\,dx + Q\,dy = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right) dx\,dy$$
    remarques: |
      Optionnel : cas d'usage typique, erreur fréquente.
    source:
      fichier: "TODO/chemin/vers/le/fichier.pdf"
      emplacement: "slide 12"     # ou "p. 34", "section 2.3"
    verifie: false                # c'est moi qui passe ce champ à true après relecture
    incertain: null               # ou une explication si le contenu source est ambigu
quiz: []                          # questions de quiz de la semaine (voir plus bas)
```

### Types de fiches

| Type         | Usage                                   | Champs spécifiques                                  |
|--------------|-----------------------------------------|-----------------------------------------------------|
| `definition` | définition d'un objet                   | `corps`                                             |
| `theoreme`   | théorème, proposition, lemme, corollaire | `hypotheses` (obligatoire), `corps`, `remarques`    |
| `formule`    | formule ou identité à connaître         | `corps`, `conditions` (domaine de validité)         |
| `methode`    | méthode de calcul ou de résolution      | `etapes` (liste), `exemple`                         |
| `syntaxe`    | nouvelle syntaxe (Soft Cons)            | `langage`, `syntaxe`, `usage`, `exemple`, `piege` (optionnels : `exemple`, `piege`) |
| `resume`     | résumé d'une notion (Comp Arch)         | `corps`, `points_cles` (liste)                      |

Champs communs à toutes les fiches : `id`, `type`, `titre`, `importance`, `source`, `verifie`, `incertain`.

Champ optionnel commun : `schema`, un schéma **redessiné en SVG** d'après le cours (jamais une image
extraite des sources, qui ne doivent pas être publiées), avec une légende en Markdown :

```yaml
    schema:
      svg: |
        <svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg"> … </svg>
      legende: |
        Explication du circuit, en citant le slide.
```

Conventions : `viewBox` obligatoire ; traits et textes en `currentColor` (mode sombre automatique) ;
classes `acc` (accent), `doux` (gris), `bloc` / `bloc-acc` (remplissage des boîtes) ; marqueurs de flèche
référencés par `url(#…)` interne. Interdits (refusés par `npm run validate`) : `<script>`, `<image>`,
`<foreignObject>`, attributs `on…`, liens externes. Avant d'écrire un schéma, le convertir en image
pour vérifier qu'il est lisible et fidèle au slide. Un schéma n'apparaît que là où il aide à comprendre.

### Questions de quiz

```yaml
quiz:
  - id: comparch-s01-q001
    type: qcm                     # qcm | vrai_faux | numerique | trace
    enonce: |
      Énoncé en Markdown, avec du code si nécessaire.
    choix: ["...", "...", "...", "..."]   # pour qcm uniquement
    reponse: 2                    # index pour qcm, booléen pour vrai_faux, valeur pour numerique/trace
    tolerance: null               # pour numerique, si pertinent
    explication: |
      Obligatoire : pourquoi la bonne réponse est correcte ET pourquoi les distracteurs sont faux.
    source: { fichier: "...", emplacement: "..." }
    verifie: false
    incertain: null
```

Le type `trace` sert aux questions du genre « que vaut le registre x5 après ce code ? ».

## Consignes par cours

### Algebra et Analyse III
- Extraire les **résultats et formules importants** de la semaine : définitions clés, théorèmes, formules, méthodes.
- Viser **entre 5 et 15 fiches par semaine**. On sélectionne, on ne recopie pas tout le cours.
- `importance: 3` uniquement pour ce qui est réellement central.
- Pas de quiz pour l'instant (ils viendront plus tard).

### Probabilités et statistique — workflow spécifique en deux étapes
Les dossiers de semaine contiennent seulement un **screenshot des numéros d'exercices**.
La matière se retrouve ainsi :

1. **Étape mapping.** Lire le screenshot, retrouver chaque exercice dans le polycop
   (les exercices numérotés y sont intégrés, ex. « Exercise 1.3 »), puis identifier la théorie
   sur laquelle il porte : en principe, la section qui **précède** l'exercice dans le polycop.
   **Ignorer les exercices et les sections marqués d'une `*`.**
   Une section formalisée plus loin dans le polycop peut être incluse si l'exercice l'utilise.
   **Si le screenshot indique aussi des chapitres/sections de cours** (ex. « Cours : Chapitre 1 et
   Sections 2.1.1, 2.1.2 »), les ajouter à la semaine via une entrée `numero: "cours"`, même si aucun
   exercice n'y renvoie : rattacher la théorie par les exercices ne sert que lorsque le screenshot
   ne donne que la liste des exercices.
   Écrire le résultat dans `content/probastat/mapping.yaml` :
   ```yaml
   semaines:
     - semaine: 1
       screenshot: "proba_stat/semaine-01/img.png"
       exercices:
         - numero: "1.3"
           localisation: "Proba_Stats_IC_20260824 (1).pdf, p. 12"
           sections_polycop: ["2.1", "2.2"]
           incertain: null
       statut: a_valider          # je passe ce champ à "valide" après vérification
   ```
2. **Étape contenu.** Générer les fiches d'une semaine **uniquement si son statut vaut `valide`**.
   Les fiches portent sur les sections du polycop listées dans le mapping, avec les mêmes règles
   que pour Algebra et Analyse III.

### Software Construction (Scala 3)
Chaque semaine est une fiche de résumé lue sur téléphone : agréable et rapide à parcourir.
Base : **uniquement** les PDF de la semaine (cours `swc-weekN` + slides SE). Rien d'inventé.
Pas de liens vers la doc. Les **exercices** du cours ne nourrissent pas les fiches de matière :
ils sont regroupés dans des cartes dédiées en fin de semaine (point 7).
Les cartes suivent cet ordre :

1. **L'essentiel en 5 lignes** — une fiche `resume` (`importance: 3`) : `corps` = thème de la semaine,
   `points_cles` = les 5 idées clés, une par point.
2. **Nouvelles syntaxes** — une fiche `syntaxe` par construction introduite cette semaine :
   `syntaxe` = la forme minimale en une ligne ; `usage` = ce qu'elle fait ;
   `exemple` **seulement** si la construction a un piège ou un comportement non évident
   (variance, for-comprehension avec gardes, currying…) ; `piege` si pertinent.
   Ne pas répéter les syntaxes des semaines précédentes.
3. **Méthodes de la bibliothèque standard** — une fiche `resume` : chaque méthode introduite cette
   semaine sous forme de signature (ex. `def foldLeft[B](z: B)(op: (B, A) => B): B`) suivie d'une phrase.
4. **À retenir** — une fiche `resume` : les règles de raisonnement de la semaine (substitution,
   preuve par induction, règles de variance…), chacune avec un mini-exemple.
5. **Partie Software Engineering** — une fiche `resume` de 3 à 6 points (debugging, tests, specs, Git) :
   pour chacun, ce qu'on fait **concrètement** avec, pas seulement sa définition.
6. **Pièges fréquents** — une fiche `resume` de 3 à 5 points au format « erreur → correction », en une ligne.
7. **Exercices du cours** — une fiche `resume` pour les exercices du cours, une autre pour ceux des slides SE :
   énoncé court, puis la solution **seulement si les slides la donnent** (sinon « Pas de solution dans les slides »).

Contraintes de forme : phrases courtes ; blocs de code de **8 lignes maximum** ; tableaux de
**3 colonnes maximum** ; code **Scala 3 avec la syntaxe par indentation**, en style fonctionnel
(pas de `var`, `while` ni `for … do`, sauf si le PDF de la semaine les introduit) ; texte en français
avec les termes techniques en anglais quand c'est le terme du cours.
**Tout exemple de code est compilé avec `scala-cli` avant d'être écrit.**
Si le PDF contient une erreur, la signaler (champ `incertain`, affiché comme encadré ⚠️) au lieu de la recopier.
Pas de quiz pour l'instant (un format spécifique sera proposé plus tard).

### Computer Architecture (cours prioritaire, le plus difficile)
- Des fiches `resume` structurées : une par notion importante, avec `points_cles`.
- **Entre 8 et 15 questions de quiz par semaine**, **faisables de tête** et plutôt **théoriques** :
  surtout des QCM et vrai/faux sur les concepts (rôle, raison d'être, conventions, fonctionnement).
  Pas d'encodage d'instruction en hexadécimal/binaire ni de longues traces ; seulement des calculs
  mentaux simples (ex. `pc + 4`, un décalage dans la pile).
- Les distracteurs des QCM doivent être plausibles et correspondre à des erreurs réelles.
- **Vérifier toute réponse numérique ou de trace en exécutant un petit script** (Python ou autre)
  avant de l'écrire dans le YAML. Ne jamais calculer seulement « de tête ».

## Interface

- Mobile-first : conçue pour une largeur d'environ 375 px, puis adaptée au desktop.
- Navigation : accueil (liste des cours) → cours (liste des semaines) → semaine (fiches en cartes) + onglet quiz.
- Mode sombre qui suit le réglage du système.
- Une fiche avec `verifie: false` affiche un petit badge discret « non vérifié ».
- Une fiche avec `incertain` non nul affiche un avertissement visible.
- Zones tactiles d'au moins 44 px, texte lisible sans zoom.

## Déploiement

Dépôt public sur GitHub (`gabestcoo/cours_ba3`), app hébergée sur **GitHub Pages** :
https://gabestcoo.github.io/cours_ba3/

Le workflow `.github/workflows/deploy.yml` déploie à chaque push sur `main`
(`npm ci` → `npm run validate` → `npm run build` → publication de `dist/` uniquement).
Il échoue si un PDF se retrouve dans `dist/`.

Seuls `app/` et `content/` font partie du build. **Les fichiers sources des cours
(PDF, slides, polycop, screenshots) ne doivent jamais être copiés dans le build ni publiés.**
