import { readFile } from "fs/promises";
import path from "path";

import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

/**
 * The brand mark as a data URI. Read from disk here rather than handed to the
 * renderer as a URL: the renderer would fetch it mid-draw, and a failure would
 * 500 the whole card. Resolving first means any problem falls back to the
 * text-only lockup.
 */
async function brandMark(): Promise<string | undefined> {
  try {
    const file = await readFile(
      path.join(process.cwd(), "public", "brand", "al-maleek-mark.png"),
    );
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/**
 * The site's social share card, drawn rather than photographed, so shared
 * links always preview with an on-brand image and there is no asset to re-cut
 * when the messaging changes.
 *
 * Served as an explicit route rather than the `opengraph-image` file
 * convention so every page references the same canonical card URL.
 */
export async function GET() {
  const logo = await brandMark();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(900px 420px at 100% 0%, rgba(109, 213, 196, 0.35), transparent 55%), radial-gradient(700px 380px at 0% 100%, rgba(184, 192, 255, 0.4), transparent 50%), #f8f8f3",
          color: "#151826",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              width={84}
              height={84}
              style={{ borderRadius: "22px", objectFit: "contain" }}
            />
          ) : null}
          <div
            style={{
              fontSize: "24px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#2aa08d",
              fontWeight: 700,
            }}
          >
            Ghanaian comedy in motion
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              fontSize: "108px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            AL MALEEK
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "rgba(21, 24, 38, 0.68)",
              lineHeight: 1.35,
              maxWidth: "920px",
            }}
          >
            Award-nominated Ghanaian comedy — skits, live shows, community,
            merch, and creator education, from Accra to the world.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "26px",
            color: "rgba(21, 24, 38, 0.55)",
          }}
        >
          <div style={{ display: "flex" }}>almaleekgh.com</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                width: "56px",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "#6dd5c4",
              }}
            />
            <div
              style={{
                width: "56px",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "#b8c0ff",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // The card is fetched by link scrapers, not readers — cache it so every
      // scrape does not re-render and re-read the mark from disk.
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
