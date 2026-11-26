# ion-menu swipe race reproduction

Minimal Ionic Angular app (blank starter, `@ionic/angular` 9.0.14) for this bug: `ion-menu` throws
`ASSERT: _before() should not be called while animating` when the menu is opened or closed from code
while a touch that started before it moves on.

## Run

```bash
npm install
npm start          # http://localhost:4200, use a touch device or the browser's touch emulation
```

## Steps by hand

Open:

1. Tap **Open menu in 2 s**.
2. Within 2 seconds, put a finger on the right edge of the screen and hold it still.
3. When the menu starts to open, drag the finger to the left.
4. The console shows `[Ionic Error]: ASSERT: _before() should not be called while animating` and an
   uncaught error.

Close:

1. Open the menu, tap **Close menu in 2 s**.
2. Within 2 seconds, put a finger anywhere on the screen and hold it still.
3. When the menu starts to close, drag the finger sideways.
4. Same error.

## Automated

```bash
npm run build
npm run reproduce
```

`scripts/reproduce.mjs` runs the steps above in Chromium with real touch events (Chrome DevTools
Protocol), plus a control where the finger goes down only after the animation started.
Expected output: cases 1 and 2 throw the assert, the control does not.
