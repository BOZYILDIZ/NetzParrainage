# Promo — Formulaire de parrainage

Application web de formulaire de parrainage avec envoi d'emails automatiques.

## Installation

```bash
cd ~/Desktop/promo
npm install
```

## Configuration

Copiez le fichier d'exemple et remplissez vos identifiants :

```bash
cp .env.example .env
```

Éditez `.env` et remplacez `votre_mot_de_passe_application_google` par votre mot de passe d'application Google.

## Lancement

```bash
npm start
```

Ouvrez ensuite votre navigateur à l'adresse : **http://localhost:3000**

## Mot de passe d'application Google

1. Connectez-vous à votre compte Google
2. Allez dans **Gérer votre compte Google** → **Sécurité**
3. Activez la **validation en deux étapes** si ce n'est pas déjà fait
4. Cherchez **Mots de passe des applications** (ou "App passwords")
5. Créez un nouveau mot de passe (sélectionnez "Autre" et nommez-le "Promo Form")
6. Copiez le code généré (16 caractères) dans le champ `SMTP_PASS` de votre `.env`

## Structure des fichiers

```
promo/
├── public/
│   ├── index.html      Interface du formulaire
│   ├── style.css       Styles
│   └── script.js       Logique frontend
├── server.js           Serveur Express + envoi email
├── package.json
├── .env.example        Modèle de configuration
├── .env                Votre configuration (ne pas partager)
└── README.md
```

## Fonctionnalités

- Formulaire responsive et épuré
- Validation côté client et serveur
- Protection honeypot anti-bot
- Rate limiting (5 soumissions / 15 min par IP)
- Email admin avec toutes les infos + date/heure
- Email de confirmation automatique au client
- Popup de succès après envoi
