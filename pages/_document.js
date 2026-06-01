import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* UTF-8 charset — MUST be first in head */}
        <meta charSet="utf-8" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:site_name" content="SPY ON THE RISE" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body data-lang="en">
        <Main />
        <NextScript />
        {/* Language persistence: restore saved language on hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('sotr-lang');if(l&&['en','fr','es'].includes(l)){document.body.setAttribute('data-lang',l);}}catch(e){}})();`
          }}
        />
      </body>
    </Html>
  );
}
