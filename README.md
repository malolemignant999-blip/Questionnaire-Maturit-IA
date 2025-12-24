# 📊 Diagnostic de Maturité IA

Un outil web interactif et adaptatif pour évaluer la maturité en Intelligence Artificielle d'une organisation à travers 6 dimensions clés.

## 🎯 Vue d'ensemble

Ce questionnaire adaptatif permet aux entreprises d'évaluer leur niveau de maturité IA sur **6 piliers stratégiques** :
- 🎯 **Stratégie & Vision** : Vision, objectifs et feuille de route IA
- ⚖️ **Gouvernance & Éthique** : Gouvernance, gestion des risques et IA responsable
- 💾 **Données & Gestion** : Qualité, accessibilité et gouvernance des données
- ⚙️ **Technologie & Infrastructure** : Plateformes, outils, MLOps et infrastructure
- 👥 **Organisation & Compétences** : Rôles, équipes, compétences et culture
- 🚀 **Applications & Valeur** : Cas d'usage métier et valeur générée

## ✨ Fonctionnalités

### 🔄 Questionnaire Adaptatif
- **Navigation dynamique** : Les questions suivantes dépendent des réponses précédentes
- **Parcours personnalisé** : Seules les questions pertinentes sont posées
- **Historique de navigation** : Possibilité de revenir en arrière pour modifier ses réponses

### 📈 Système de Scoring Intelligent
- **Scoring par question** : Chaque réponse est notée de 0 à 4 points
- **Score par pilier** : Calcul automatique du pourcentage de maturité pour chaque dimension
- **Score global** : Évaluation globale de la maturité IA de l'organisation
- **3 niveaux de maturité** :
  - 🟥 **Débutant** (0-33%)
  - 🟨 **Intermédiaire** (34-66%)
  - 🟩 **Avancé** (67-100%)

### 📊 Visualisations Interactives
- **Graphique radar** : Vue d'ensemble des 6 piliers
- **Graphique en barres** : Comparaison des scores par dimension
- **Barres de progression** : Suivi en temps réel pendant le questionnaire
- **Détails par pilier** : Score, niveau et nombre de questions répondues

### 💡 Recommandations Personnalisées
- Recommandations basées sur le **niveau de chaque pilier**
- Recommandations basées sur les **tags** des réponses
- Affichage des 8 recommandations prioritaires

### 📥 Export des Résultats
- Export du rapport complet au format texte
- Inclut les scores, niveaux et recommandations

## 🚀 Installation et Utilisation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Un serveur web local (optionnel, pour éviter les problèmes CORS)

### Démarrage Rapide

#### Option 1 : Serveur Python (Recommandé)
```bash
# Dans le répertoire du projet
python3 -m http.server 8080

# Ouvrir dans le navigateur
# http://localhost:8080
```

#### Option 2 : Serveur Node.js
```bash
# Installer http-server globalement
npm install -g http-server

# Lancer le serveur
http-server -p 8080

# Ouvrir dans le navigateur
# http://localhost:8080
```

#### Option 3 : Ouvrir directement
Vous pouvez ouvrir `index.html` directement dans votre navigateur, mais certaines fonctionnalités peuvent être limitées à cause des restrictions CORS.

## 📁 Structure du Projet

```
questionnaire_maturite_IA/
├── index.html              # Page principale HTML
├── styles.css              # Styles CSS (design moderne dark theme)
├── app.js                  # Logique JavaScript du questionnaire
├── data/
│   └── questionnaire.json  # Données du questionnaire (questions, piliers, scoring)
└── README.md              # Ce fichier
```

## 📋 Structure des Données JSON

Le fichier `data/questionnaire.json` contient toute la logique du questionnaire :

### Métadonnées
```json
{
  "version": "1.0.0",
  "language": "fr",
  "metadata": {
    "name": "Diagnostic de maturité IA",
    "entry_question_id": "Q101"
  }
}
```

### Niveaux de Scoring
- **Niveaux globaux** : Débutant, Intermédiaire, Avancé
- **Niveaux par pilier** : Faible, Moyen, Élevé

### Piliers
Chaque pilier contient :
- `id` : Identifiant unique (STRAT, GOV, DATA, etc.)
- `name` : Nom du pilier
- `icon` : Emoji représentatif
- `weight` : Poids dans le calcul global (actuellement 1.0 pour tous)
- `description` : Description du pilier

### Questions
Chaque question contient :
- `pillar_id` : Pilier auquel elle appartient
- `text` : Texte de la question
- `help` : Aide contextuelle (optionnel)
- `type` : Type de question (actuellement "single_choice")
- `options` : Liste des réponses possibles

### Options de Réponse
Chaque option contient :
- `id` : Identifiant unique
- `label` : Texte de la réponse
- `score` : Score attribué (0 à 4)
- `next_question_id` : ID de la prochaine question (null si fin)
- `tags` : Tags pour les recommandations (optionnel)

### Recommandations
- `by_pillar_level` : Recommandations par pilier et niveau
- `by_tag` : Recommandations basées sur les tags des réponses

## 🧮 Système de Scoring

### Scoring par Question
Chaque réponse reçoit un score de **0 à 4 points** :
- **0 point** : Situation absente ou très faible
- **1-2 points** : Début de démarche, partiel
- **3 points** : Démarche en place mais incomplète
- **4 points** : Maturité élevée

### Score par Pilier
```javascript
Score total = Somme des scores des questions répondues
Score maximum = Nombre total de questions du pilier × 4
Pourcentage = (Score total / Score maximum) × 100
```

**Niveaux par pilier** :
- **Faible** : 0-39%
- **Moyen** : 40-69%
- **Élevé** : 70-100%

### Score Global
```javascript
Score global = Somme de tous les scores des piliers
Score maximum global = Somme de tous les scores maximums possibles
Pourcentage global = (Score global / Score maximum global) × 100
```

**Niveaux globaux** :
- **Débutant** : 0-33%
- **Intermédiaire** : 34-66%
- **Avancé** : 67-100%

### Exemple de Calcul

**Scénario** :
- STRAT : 2 questions → Scores 3 + 4 = 7/8 = 87.5% → **Élevé**
- GOV : 1 question → Score 2/4 = 50% → **Moyen**
- DATA : 2 questions → Scores 1 + 3 = 4/8 = 50% → **Moyen**

**Score global** :
- Total : 7 + 2 + 4 = 13 points
- Maximum : 8 + 4 + 8 = 20 points
- Pourcentage : (13/20) × 100 = **65%** → **Intermédiaire**

## 🎨 Personnalisation

### Modifier les Questions
Éditez le fichier `data/questionnaire.json` pour :
- Ajouter/modifier/supprimer des questions
- Changer les options de réponse
- Modifier les chemins de navigation (`next_question_id`)
- Ajouter des tags pour les recommandations

### Modifier les Couleurs
Les couleurs des piliers sont définies dans `app.js` :
```javascript
const colors = {
    'STRAT': '#8b5cf6',
    'GOV': '#06b6d4',
    'DATA': '#22c55e',
    'TECH': '#f59e0b',
    'ORG': '#ec4899',
    'APPS': '#3b82f6'
};
```

### Modifier le Design
Le fichier `styles.css` contient toutes les variables CSS pour personnaliser :
- Couleurs de fond
- Couleurs d'accentuation
- Tailles de police
- Espacements
- Animations

## 🛠️ Technologies Utilisées

- **HTML5** : Structure de la page
- **CSS3** : Styles et animations (variables CSS, flexbox, grid)
- **JavaScript (ES6+)** : Logique du questionnaire
- **Chart.js** : Graphiques interactifs (radar et barres)
- **Google Fonts** : Polices Outfit et JetBrains Mono

## 📝 Notes Importantes

### Questionnaire Adaptatif
Le questionnaire est **adaptatif** : toutes les questions ne sont pas posées systématiquement. Le parcours dépend des réponses :
- Si une réponse indique une absence totale, certaines questions de suivi peuvent être sautées
- Le score est calculé uniquement sur les questions posées et répondues

### Barres de Progression
Les barres de progression dans la sidebar affichent le pourcentage basé sur **toutes les questions possibles** du pilier, pas seulement celles répondues. Cela donne une vision réaliste de la maturité complète.

## 🔧 Développement

### Structure du Code JavaScript

- **State Management** : Variables globales pour `questionnaireData`, `currentQuestionId`, `answers`
- **Navigation** : Fonctions `goToNextQuestion()`, `goToPreviousQuestion()`
- **Rendu** : Fonctions `renderQuestion()`, `renderCharts()`, `renderDetails()`
- **Calculs** : Fonction `calculateResults()` pour le scoring
- **Export** : Fonction `exportResults()` pour générer le rapport

### Ajouter une Nouvelle Question

1. Ajouter la question dans `data/questionnaire.json` :
```json
"QXXX": {
  "pillar_id": "STRAT",
  "text": "Votre question ?",
  "help": "Aide contextuelle",
  "type": "single_choice",
  "options": [...]
}
```

2. Référencer cette question dans `next_question_id` d'une autre question

3. Le système détectera automatiquement la nouvelle question

## 📄 Licence

Ce projet est fourni tel quel pour usage interne.

## 🤝 Contribution

Pour contribuer au projet :
1. Modifier les questions dans `data/questionnaire.json`
2. Adapter les recommandations selon les besoins
3. Personnaliser le design dans `styles.css`
4. Tester le questionnaire avec différents parcours

## 📞 Support

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue ou à contacter l'équipe.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024

