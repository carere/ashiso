// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" class="size-full">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <script src="https://kit.fontawesome.com/8456a20b53.js" crossorigin="anonymous" />
          {assets}
        </head>
        <body class="size-full">
          <main id="app" class="size-full">
            {children}
          </main>
          {scripts}
        </body>
      </html>
    )}
  />
));
