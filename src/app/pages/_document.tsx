import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Link to manifest.json */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link
          rel="icon"
          href="/icons/icon-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/icon-512x512.png"
          sizes="512x512"
          type="image/png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
