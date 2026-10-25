<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import AboutOrbit from "./lib/AboutOrbit.svelte";
  import cartesian from "./lib/data/cartesian.json";
  import cosmo from "./lib/data/cosmo.json";
  import contraption from "./lib/data/contraption.json";
  import self from "./lib/data/self.json";

  const allProjects = [...cartesian, ...cosmo, ...contraption, ...self];

  let sidebarWidth = $state(36);
  let isResizing = $state(false);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const MIN_SIDEBAR = 260;
  const MIN_MAP = 300;

  function updateSidebarWidth(clientX) {
    const workspace = document.querySelector(".workspace");
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const availableWidth = rect.width;
    const sidebarPixels = rect.right - clientX;

    const minSidebarPercent = (MIN_SIDEBAR / availableWidth) * 100;
    const minMapPercent = (MIN_MAP / availableWidth) * 100;

    sidebarWidth = Math.max(
      minSidebarPercent,
      Math.min(100 - minMapPercent, (sidebarPixels / availableWidth) * 100),
    );
  }

  function startResize(event) {
    // Non avviare il trascinamento con il tasto centrale o destro.
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();
    isResizing = true;

    const onMove = (e) => {
      if (!isResizing) return;
      updateSidebarWidth(e.clientX);
    };

    const onUp = () => {
      isResizing = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      map?.resize();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function resetSidebarWidth() {
    sidebarWidth = 36;
    requestAnimationFrame(() => map?.resize());
  }

  let mapElement;
  let map;
  let selected = $state(null);
  let mapReady = $state(false);
  let search = $state("");
  let mediaIndex = $state(0);
  const mediaBase = " ";
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

  const slugify = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Existing entries without an id receive a deterministic fallback for this prototype.
  const getId = (place) => place.id || slugify(`${place.city}-${place.state}`);

  function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  const enriched = shuffle(allProjects).map((p) => ({
    ...p,
    id: getId(p),
  }));

  const getMedia = (place) => [place.imageCover, place.image].filter(Boolean);
  const filtered = $derived(
    enriched.filter((place) => {
      const query = search.trim().toLowerCase();

      return (
        !query ||
        place.city?.toLowerCase().includes(query) ||
        place.state?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query)
      );
    }),
  );

  function setPlace(place, updateUrl = true) {
    selected = place;
    mediaIndex = 0;

    if (mapReady) {
      highlightRitual(place);
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (place) url.searchParams.set("place", place.id);
      else url.searchParams.delete("place");
      history.pushState({ place: place?.id ?? null }, "", url);
    }

    if (place && map) {
      map.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 6.4,
        bearing: 180,
        pitch: 0,
        duration: 5000,
        essential: true,
      });
    }
  }

  function syncFromUrl() {
    const id = new URLSearchParams(window.location.search).get("place");
    const place = enriched.find((p) => p.id === id) ?? null;

    selected = place;
    mediaIndex = 0;

    if (map && mapReady) {
      highlightRitual(place);

      if (place) {
        map.flyTo({
          center: [place.longitude, place.latitude],
          zoom: 6.4,
          bearing: 180,
          pitch: 0,
          duration: 5000,
        });
      }
    }
  }

  function shareUrl() {
    if (!selected) return;
    navigator.clipboard?.writeText(window.location.href);
  }

  const fogSettings = {
    range: [0.8, 8],
    "horizon-blend": 0.5,
    color: "#e3e5c7",
    "space-color": "#a66480",
    "high-color": "#000000",
    "star-intensity": 0.15,
  };

  const lightSettings = {
    id: "flat",
    type: "flat",
    properties: {
      anchor: "viewport",
      color: "white",
      intensity: 0.4,
    },
  };

  function highlightRitual(ritual) {
    const source = map.getSource("selected-ritual");

    if (!source) return;

    if (!ritual) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }

    source.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: ritual.id,
            color: ritual.color || "#e7d41e",
          },
          geometry: {
            type: "Point",
            coordinates: [
              Number(ritual.longitude ?? ritual.lng),
              Number(ritual.latitude ?? ritual.lat),
            ],
          },
        },
      ],
    });
  }

  let aboutOpen = $state(false);

  function closeAbout() {
    aboutOpen = false;
  }

  function openAbout() {
    aboutOpen = true;
  }

  function handleAboutKeydown(event) {
    if (event.key === "Escape" && aboutOpen) {
      closeAbout();
    }
  }

  onMount(() => {
    if (!mapboxToken) {
      console.warn(
        "Mapbox token missing: set VITE_MAPBOX_ACCESS_TOKEN in .env.local",
      );
    }
    map = new mapboxgl.Map({
      container: mapElement,
      accessToken: mapboxToken,
      style: "mapbox://styles/comuni-dados/ck87kqz1v0hlt1iptdomrfl1y",
      center: [-18, 0],
      zoom: isMobile ? 0.7 : 1.8,
      bearing: 180,
      pitch: 0,
      attributionControl: true,
      projection: { name: "globe" },
    });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    map.on("style.load", () => {
      map.setFog(fogSettings);
      map.setLights([lightSettings]);
      map.setBearing(180);
      map.addSource("rituals", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: enriched.map((p) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
            properties: {
              id: p.id,
              title: p.city,
              color: p.color || "#e7d41e",
            },
          })),
        },
      });
      map.addLayer({
        id: "ritual-points",
        type: "circle",
        source: "rituals",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 3.5, 4, 6],
          "circle-color": ["get", "color"],
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-width": 1.25,
        },
      });
      map.on("click", "ritual-points", (event) => {
        const id = event.features?.[0]?.properties?.id;
        const place = enriched.find((p) => p.id === id);
        if (place) setPlace(place);
      });
      map.on(
        "mouseenter",
        "ritual-points",
        () => (map.getCanvas().style.cursor = "pointer"),
      );
      map.on(
        "mouseleave",
        "ritual-points",
        () => (map.getCanvas().style.cursor = ""),
      );
      map.addSource("selected-ritual", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "selected-ritual-glow",
        type: "circle",
        source: "selected-ritual",
        paint: {
          "circle-radius": 11,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.18,
          "circle-blur": 0.5,
        },
      });

      map.addLayer({
        id: "selected-ritual-point",
        type: "circle",
        source: "selected-ritual",
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 10,
          "circle-opacity": 1,
        },
      });
      mapReady = true;
      syncFromUrl();
    });

    const onPopState = () => syncFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      map?.remove();
    };
  });
</script>

<svelte:head>
  <meta
    name="description"
    content="Svelte + Mapbox GL JS prototype for Carto Rituals."
  />
</svelte:head>

<svelte:window onkeydown={handleAboutKeydown} />

<button
  class="about-trigger"
  type="button"
  onclick={openAbout}
  aria-haspopup="dialog"
  aria-expanded={aboutOpen}
>
  ABOUT <span aria-hidden="true"></span>
</button>

{#if aboutOpen}
  <div
    class="about-backdrop"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) closeAbout();
    }}
  >
    <AboutOrbit />

    <section
      class="about-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <button
        class="about-close"
        type="button"
        onclick={closeAbout}
        aria-label="Close about"
      >
        ×
      </button>

      <header class="about-header">
        <h2 id="about-title">RITUALS IN THE CARTOGRAPHIC PRACTICE</h2>
      </header>

      <article class="about-content">
        <p>
          <strong>
            Cartography is mainly a social process. No amount of high-resolution
            mapping can match the credibility and legitimacy of community-led
            /commons-oriented social mapping.
          </strong>
        </p>

        <p>
          <strong>
            Assuming many ways of knowing and multiple systems of knowledge,
            <u
              >cartographic-making is a ritual that starts with a collective and
              political encounter</u
            >.
          </strong>
        </p>

        <p>
          <strong>
            The Visual Archive hosts social technology practices and
            participatory cartography from the Global South as an endogenous
            product of the multiple relationship between
            body-territory-language. It brings together customs, organisational
            arrangements, local knowledge, ecology of the region, and its
            historical, economic, social and cultural reality.
          </strong>
        </p>

        <p>
          <strong>
            The archive is structured into categories to make different fields
            of practice accessible while recognising their connections and
            overlaps. These categories are not intended as fixed taxonomies or
            universal classifications. They are editorial tools: ways to
            navigate a heterogeneous body of knowledge, identify recurring
            approaches, and reveal relationships between practices,
            technologies, territories, and forms of collective action. Each
            entry is therefore understood not as a self-contained example, but
            as part of a wider constellation of situated experiences. The
            archive remains open to new contributions, interpretations, and
            connections.
          </strong>
        </p>

        <p>
          The archive was launched to gather resources from the workshop
          'Rituals in the Cartographic Practice' organised in March 2023 at the
          Design Academy of Eindhoven.<br />
          The archive is dedicated to Indigenous peoples, ethnic minorities, and
          all marginalised communities whose knowledge, histories, languages, and
          ways of inhabiting the world have been silenced, appropriated, devalued,
          or erased by colonialism, racism, and dominant systems of knowledge. It
          stands against epistemic racism: the unequal distribution of authority,
          legitimacy, and visibility through which certain forms of knowledge are
          elevated as universal, objective, or scientific, while others are dismissed
          as inferior, irrational, folkloric, or irrelevant.
        </p>

        <p class="about-update">Database last update: 19th June 2026</p>

        <a
          class="about-contact"
          href="https://ee.humanitarianresponse.info/x/iAdJUZ2L"
          target="_blank"
          rel="noreferrer"
        >
          ✉ GETTING INFORMATION AND SUGGESTING RITUALS
        </a>
      </article>
    </section>
  </div>
{/if}

<main>
  <!-- <header class="masthead">
    <div class="eyebrow title-arc">Rituals in the cartographic practice</div>
    <div class="heading-row">
      <div>
        <h1>Carto Rituals</h1>
        <p class="subtitle">Visual archive · Svelte + Mapbox GL JS</p>
      </div>
      <div class="status">
        <span class:online={mapReady}></span>{mapReady
          ? "Globo pronto"
          : "Caricamento globo…"}
      </div>

    </div>
  </header> -->

  <section
    class="workspace"
    class:resizing={isResizing}
    style={`--sidebar-width: ${sidebarWidth}%`}
  >
    <div class="map-shell">
      <svg
        class="curved-title"
        viewBox="0 0 800 200"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Rituals in the cartographic practice"
      >
        <defs>
          <path id="title-arc" d="M 80,160 Q 400,-20 720,160" />
        </defs>

        <text fill="#111" font-size="22" font-weight="600" letter-spacing="2">
          <textPath href="#title-arc" startOffset="50%" text-anchor="middle"
            >RITUALS IN THE CARTOGRAPHIC PRACTICE</textPath
          >
        </text>
      </svg>

      <div class="map" bind:this={mapElement}></div>
    </div>

    <div
      class="resize-handle"
      role="separator"
      aria-label="Ridimensiona mappa e sidebar"
      aria-orientation="vertical"
      aria-valuenow={Math.round(sidebarWidth)}
      tabindex="0"
      onpointerdown={startResize}
      ondblclick={resetSidebarWidth}
      onkeydown={(event) => {
        if (event.key === "Home") resetSidebarWidth();
        if (event.key === "ArrowLeft") {
          sidebarWidth = Math.min(75, sidebarWidth + 2);
          requestAnimationFrame(() => map?.resize());
        }
        if (event.key === "ArrowRight") {
          sidebarWidth = Math.max(20, sidebarWidth - 2);
          requestAnimationFrame(() => map?.resize());
        }
      }}
    >
      <span></span>
    </div>

    <aside class="sidebar">
      <div class="sidebar-head">
        <h2><span>{filtered.length}</span>RITUALS</h2>
        <input
          aria-label="Cerca progetti"
          placeholder="Search by title or place…"
          bind:value={search}
        />
      </div>
      <div class="place-list" class:has-selection={selected}>
        {#each filtered as place (place.id)}
          <button
            class:active={selected?.id === place.id}
            class="place-row"
            style={`--place-color: ${place.color || "#e7d41e"}`}
            onclick={() => setPlace(place)}
          >
            <span class="dot" style={`--dot: ${place.color || "#e7d41e"}`}
            ></span>

            <span class="place-text">
              <strong>{place.city.replace(/<[^>]*>/g, "")}</strong>
              <small>{place.state}</small>
            </span>
          </button>
        {/each}
      </div>
      {#if selected}
        <article class="detail">
          <!--           <button
            class="close"
            aria-label="Chiudi scheda"
            onclick={() => setPlace(null)}>×</button
          >
 -->
          {#if selected.category}
            <div class="category">{selected.category}</div>{/if}

          <h2>{selected.city.replace(/<[^>]*>/g, "")}</h2>
          <p class="location">{selected.state}</p>
          {#if selected.videoCover}
            <div class="video-cover">
              <iframe
                src={selected.videoCover}
                title={`Video: ${selected.city?.replace(/<[^>]*>/g, "") ?? "progetto"}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          {/if}

          {#if getMedia(selected).length}
            <div class="gallery">
              <img
                class="cover"
                src={getMedia(selected)[mediaIndex]}
                alt={`Image ${mediaIndex + 1} for ${selected.city}`}
                loading="lazy"
                onerror={(event) => {
                  event.currentTarget.src = `${mediaBase}image-placeholder.svg`;
                }}
              />
              {#if getMedia(selected).length > 1}
                <div class="gallery-controls">
                  <button
                    onclick={() =>
                      (mediaIndex =
                        (mediaIndex + getMedia(selected).length - 1) %
                        getMedia(selected).length)}
                    aria-label="Previous image">←</button
                  >
                  <span style="font-size: 10px;"
                    >{mediaIndex + 1} / {getMedia(selected).length}</span
                  >
                  <button
                    onclick={() =>
                      (mediaIndex =
                        (mediaIndex + 1) % getMedia(selected).length)}
                    aria-label="Next image">→</button
                  >
                </div>
              {/if}
            </div>
          {/if}
          {#if selected.description}<p>
              {@html selected.description}
            </p>{/if}
          {#if selected.video}
            <p class="media-link">
              <a href={selected.video} target="_blank" rel="noreferrer"
                >Open video ↗</a
              > <small>(placeholder URL)</small>
            </p>
          {/if}
          <dl>
            {#if selected.language}<dt>Language</dt>
              <dd>{selected.language}</dd>{/if}
            {#if selected.scale}<dt>Scale</dt>
              <dd>{selected.scale}</dd>{/if}
            {#if selected.participationLevel}<dt>Participation</dt>
              <dd>{selected.participationLevel}</dd>{/if}
            {#if selected.right}<dt>Rights</dt>
              <dd>{selected.right}</dd>{/if}
            {#if selected.deliverables}<dt>Deliverables</dt>
              <dd>{@html selected.deliverables}</dd>{/if}
          </dl>
          <div class="detail-actions">
            <!-- <button class="primary" onclick={shareUrl}>Copy URL</button> -->
            <button onclick={() => setPlace(null)}>Close ritural</button>
          </div>
        </article>
      {:else}
        <!--         <div class="empty">
          <span class="empty-symbol">＋</span>
          <strong>Select a point</strong>
          <p>
            Click a point on the globe or choose a project from the index. The
            URL will update to link directly to its card.
          </p>
        </div>
 -->
      {/if}
    </aside>
  </section>
</main>

<style>
  main {
    display: block;
  }

  .curved-title {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: min(800px, 90%);
    height: auto;
    z-index: 1000;
    pointer-events: none;
    overflow: visible;
  }

  .workspace,
  .map-shell {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .map-shell {
    z-index: 0;
  }

  .map-container {
    position: absolute;
    inset: 0;
  }
</style>
