import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    /* `ctx.locale` est la source fiable côté serveur (Pages Router i18n) ;
       `ctx.__NEXT_DATA__` n'existe pas dans le contexte du Document, d'où le
       bug où `<html lang>` restait toujours sur la locale par défaut. */
    const locale =
      (ctx as any).locale ||
      (ctx as any).__NEXT_DATA__?.locale ||
      'fr';
    return { ...initialProps, locale };
  }

  render() {
    const locale = ((this.props as any).locale || 'fr') as string;

    /* Le script de thème vit dans /public/theme-init.js (fichier statique)
       afin que la CSP puisse être stricte : aucun script inline = pas de
       'unsafe-inline' sur script-src. Contenu identique, exécuté avant le
       premier rendu (anti-FOUC). */

    return (
      <Html lang={locale}>
        <Head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/favicon.png" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#efeae1" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c0c0b" />

          {/* Polices auto-hébergées : aucune requête tierce, aucun CLS.
               Préchargées : display (900), texte (400), mono 400 (métadonnées
               par défaut, présente dès le hero), mono 500 (index de nav) et
               l'italique serif d'accent — le mot accentué du h1 est au-dessus
               de la ligne de flottaison, son chargement tardif se voyait */}
          <link rel="preload" as="font" type="font/woff2" href="/fonts/satoshi-900.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/fonts/satoshi-400.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/fonts/satoshi-500.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/fonts/ibm-plex-mono-400.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/fonts/ibm-plex-mono-500.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/fonts/instrument-serif-400-italic.woff2" crossOrigin="anonymous" />

          {/* Script synchrone VOLONTAIRE : il doit s'exécuter avant le
               premier peinture pour éviter le flash du thème (FOUC).
               `next/script` (beforeInteractive) ne garantit pas cet ordre.
               Fichier statique externe = compatible CSP stricte. */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="/theme-init.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
