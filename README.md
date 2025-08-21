# HomeCyclHome — App ADMIN

### Interface d’administration (Next.js) pour la gestion des zones, techniciens, demandes, etc.

## 🚀 Accès

PROD : https://admin.homecyclhome.site

TEST : https://admin-test.homecyclhome.site

L’app TEST pointe vers l’API TEST (https://api-test.homecyclhome.site/api/).
L’app PROD pointe vers l’API PROD (https://api.homecyclhome.site/api/).

## 🔐 Se connecter (création d’un admin en TEST)

Créer un compte admin directement dans le conteneur API TEST :

php bin/console create-admin "admin.test@homecyclhome.site" "MotDePasseSolide" "Prenom" "Nom"

## 🔁 Déploiement (workflows)

TEST : déploiement automatique à chaque push sur main.

PROD : déploiement manuel depuis l’onglet Actions de GitHub.

Les workflows forcent -p homecyclhome_admin / -p homecyclhome_admin_test pour séparer les stacks.

## 🛠️ Dépannage éclair

502 sur le domaine test

sudo systemctl reload caddy
sudo ss -ltnp | egrep ':3101' || true
docker compose -p homecyclhome_admin_test logs --since=2m app


Permissions Git dans le dossier test

cd /var/www/homecyclhome_test/homecyclhome_admin
sudo chown -R randre:randre .
git fetch origin main && git reset --hard origin/main

## 📦 Dev notes (résumé)

Next.js en output standalone (Docker-ready).

Images distantes autorisées pour api.homecyclhome.site et api-test.homecyclhome.site.

Télémetry Next désactivée en prod/test (NEXT_TELEMETRY_DISABLED=1).