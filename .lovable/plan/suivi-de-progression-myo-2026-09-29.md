# Suivi de progression MYO

## Objectif
Ajouter un quatrième espace « Progression » à MYO, sans serveur, puis réorganiser la barre Liquid Glass autour de quatre destinations : Configurer, Progression, Lancer et Paramètres. Le créateur de séance gardera son en-tête visible pendant le défilement.

## Fonctionnalités
- Enregistrer automatiquement chaque série validée avec la date, l’exercice, la charge et le volume réalisé.
- Finaliser une séance dans l’historique lorsque sa dernière série est validée.
- Créer un écran « Progression » qui rassemble :
  - résumé global (séances terminées, séries, volume total) ;
  - records personnels par exercice ;
  - évolution des charges par exercice ;
  - historique des séances, de la plus récente à la plus ancienne, avec détail des exercices.
- Prévoir un état vide clair tant qu’aucune séance n’est terminée.
- Conserver les données localement et hors ligne, conformément au fonctionnement actuel.

## Navigation et présentation
- Refaire la barre Liquid Glass avec quatre commandes compactes et leurs icônes :
  - Configurer ;
  - Progression avec une icône graphique ;
  - Lancer avec une icône lecture ;
  - Paramètres.
- Garder l’identité cockpit noir OLED, les libellés techniques et la typographie monospace.
- Rendre l’état actif immédiatement identifiable sans agrandir ou déplacer la barre.
- Maintenir la barre hors des écrans de création et d’exécution, comme actuellement.

## Créateur de séance
- Épingler en haut l’en-tête contenant le retour et le titre du créateur.
- Lui donner un fond opaque adapté à l’écran OLED afin que le contenu défilant reste lisible dessous.
- Conserver le bouton Enregistrer fixé en bas.

## Détails techniques
- Étendre le stockage local avec une structure versionnée dédiée aux séances terminées et aux séries réalisées.
- Capturer la charge réellement affichée au moment où chaque série est validée, y compris après utilisation des boutons − / +.
- Calculer les statistiques depuis l’historique local : volume = somme des charges de chaque série validée ; record = charge maximale par exercice.
- Ajouter une route `/progress` avec ses métadonnées propres, puis relier la barre à cette route.
- Préserver les séances déjà enregistrées et les réglages existants.

## Vérification
- Tester la navigation sur les quatre écrans en format mobile.
- Créer et exécuter une courte séance, modifier une charge, la terminer, puis confirmer que l’historique, le volume, le record et l’évolution affichent les bonnes valeurs.
- Vérifier que l’en-tête du créateur reste visible pendant le défilement et qu’aucun contenu n’est masqué par les éléments fixes.
