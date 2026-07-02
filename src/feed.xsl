<?xml version="1.0" encoding="utf-8"?>
<!--
  Styl pro zobrazení RSS/Atom kanálu v prohlížeči (odkazuje se z feed.xml přes
  volbu `stylesheet` v eleventy-plugin-rss). Čtečky XSLT ignorují a čtou holé XML.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/atom:feed">
    <html lang="cs">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="atom:title" /> — RSS kanál</title>
        <style>
          :root {
            --bg: #ede8da; --card: #f8f4e9; --ink: #293433; --soft: #5d6b69;
            --accent: #3f6a57; --rule: rgba(20,30,30,.12);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #14140e; --card: #1c1f15; --ink: #dfe6e4; --soft: #9fb0ac;
              --accent: #8fae9e; --rule: rgba(255,255,255,.1);
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0; padding: 2.5rem 1.2rem 4rem; background: var(--bg); color: var(--ink);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6; -webkit-font-smoothing: antialiased;
          }
          .wrap { max-width: 42rem; margin: 0 auto; }
          .card {
            background: var(--card); border: 1px solid var(--rule); border-radius: .6rem;
            padding: 1.6rem 1.8rem; margin-bottom: 2rem;
          }
          .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; color: var(--accent); margin: 0 0 .5rem; }
          h1 { font-family: Georgia, "Times New Roman", serif; font-weight: 400; font-size: 1.9rem; margin: 0 0 .3rem; }
          .sub { color: var(--soft); margin: 0 0 1rem; }
          .note { font-size: .9rem; color: var(--soft); margin: 0; }
          .note a, a.home { color: var(--accent); }
          ul { list-style: none; padding: 0; margin: 0; }
          li { padding: 1.1rem 0; border-bottom: 1px solid var(--rule); }
          li:last-child { border-bottom: 0; }
          .title { font-family: Georgia, "Times New Roman", serif; font-size: 1.3rem; color: var(--ink); text-decoration: none; }
          .title:hover { color: var(--accent); }
          .date { color: var(--soft); font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; margin-top: .2rem; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="card">
            <p class="eyebrow">RSS / Atom kanál</p>
            <h1><xsl:value-of select="atom:title" /></h1>
            <p class="sub"><xsl:value-of select="atom:subtitle" /></p>
            <p class="note">
              Tohle je <strong>kanál pro čtečky</strong> — vlož adresu této stránky do své
              RSS čtečky a budeš dostávat nové články. Nebo se vrať
              <a class="home"><xsl:attribute name="href"><xsl:value-of select="atom:link[not(@rel='self')]/@href" /></xsl:attribute>na web</a>.
            </p>
          </div>

          <ul>
            <xsl:for-each select="atom:entry">
              <li>
                <a class="title">
                  <xsl:attribute name="href"><xsl:value-of select="atom:link/@href" /></xsl:attribute>
                  <xsl:value-of select="atom:title" />
                </a>
                <div class="date"><xsl:value-of select="substring(atom:updated, 1, 10)" /></div>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
