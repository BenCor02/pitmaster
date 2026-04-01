# Charbon & Flamme — Build Android

## Prérequis

- [Android Studio](https://developer.android.com/studio) (dernière version)
- Java 17+ (inclus avec Android Studio)
- Node.js 18+
- npm

## Setup initial (une seule fois)

```bash
# 1. Installer les dépendances
npm install

# 2. Builder le site web
npm run build

# 3. Générer le projet Android
npx cap add android

# 4. Synchroniser le web → Android
npx cap sync
```

## Ouvrir dans Android Studio

```bash
npx cap open android
```

Ou ouvrir manuellement le dossier `android/` dans Android Studio.

## Configurer les icônes

1. Dans Android Studio : **File → New → Image Asset**
2. Utiliser `public/icon-512.png` comme source
3. Configurer :
   - Background color: `#0a0a0a`
   - Resize: 70%
4. Cliquer **Next → Finish**

Pour l'icône de notification (`ic_stat_flame`) :
1. **File → New → Image Asset**
2. Type: **Notification Icons**
3. Utiliser le logo flamme comme source
4. Name: `ic_stat_flame`

## Splash Screen

Le splash est configuré dans `capacitor.config.ts`. Pour personnaliser :

1. Créer `android/app/src/main/res/drawable/splash.xml` :
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_bg" />
    <item android:gravity="center" android:width="128dp" android:height="128dp">
        <bitmap android:src="@mipmap/ic_launcher" android:gravity="center" />
    </item>
</layer-list>
```

2. Ajouter dans `android/app/src/main/res/values/colors.xml` :
```xml
<color name="splash_bg">#0a0a0a</color>
```

## Build quotidien

```bash
# Rebuild complet
npm run cap:build

# Ou juste sync (si le web est déjà buildé)
npm run cap:sync
```

Puis dans Android Studio : **Run → Run 'app'** (ou Shift+F10)

## Build release (APK / AAB pour le Play Store)

1. Dans Android Studio : **Build → Generate Signed Bundle / APK**
2. Choisir **Android App Bundle** (AAB) pour le Play Store
3. Créer ou utiliser une keystore existante
4. Build variant: **release**
5. Le fichier `.aab` sera dans `android/app/build/outputs/bundle/release/`

## Permissions Android

Les permissions sont automatiquement ajoutées par les plugins Capacitor.
Vérifier dans `android/app/src/main/AndroidManifest.xml` :

```xml
<!-- Bluetooth (Meater BLE) -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Dev mode (hot reload)

Pour utiliser le hot reload Vite pendant le dev :

1. Décommenter la ligne `url` dans `capacitor.config.ts` :
   ```ts
   url: 'http://10.0.2.2:5173',
   ```
2. Lancer `npm run dev` sur ton PC
3. Lancer l'app sur l'émulateur Android
4. L'app charge depuis le serveur Vite local

> `10.0.2.2` = l'IP de l'hôte vu depuis l'émulateur Android.

## Troubleshooting

- **Écran blanc** : Vérifier que `npm run build` a bien généré le dossier `dist/`
- **BLE ne scanne pas** : Activer le GPS (requis pour le BLE scan sur Android 12+)
- **Notifications silencieuses** : Vérifier les canaux dans les paramètres Android
