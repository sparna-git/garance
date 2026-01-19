document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------------------------
  // References
  // -----------------------------------------------------
  const sparnatural = document.querySelector("spar-natural");
  const historyComponent = document.querySelector("sparnatural-history");
  // -----------------------------------------------------
  // Sample queries
  // -----------------------------------------------------
  let sampleQueries = [];
  const lang =
    document.documentElement.lang || sparnatural.getAttribute("lang") || "fr";

  if (!sparnatural) {
    console.error("spar-natural not found");
    return;
  }

  let lastQueryJson = null;

  // -----------------------------------------------------
  // Endpoint display
  // -----------------------------------------------------
  const displayEndpoint = document.querySelector("#displayEndpoint");
  if (displayEndpoint) {
    displayEndpoint.href = sparnatural.getAttribute("endpoint");
    displayEndpoint.textContent = sparnatural.getAttribute("endpoint");
  }

  // -----------------------------------------------------
  // YASQE
  // -----------------------------------------------------
  const yasqe = new Yasqe(document.getElementById("yasqe"), {
    requestConfig: {
      endpoint: sparnatural.getAttribute("endpoint"),
      method: "GET",
    },
    copyEndpointOnNewTab: false,
  });

  // -----------------------------------------------------
  // YASR
  // -----------------------------------------------------
  Yasr.registerPlugin("TableX", SparnaturalYasguiPlugins.TableX);
  Yasr.registerPlugin("Grid", SparnaturalYasguiPlugins.GridPlugin);
  Yasr.registerPlugin("Map", SparnaturalYasguiPlugins.MapPlugin);
  delete Yasr.plugins["table"];

  const yasr = new Yasr(document.getElementById("yasr"), {
    pluginOrder: ["Grid", "TableX", "Map", "response"],
    defaultPlugin: "Grid",
  });

  yasqe.on("queryResponse", (_, response, duration) => {
    yasr.setResponse(response, duration);
    sparnatural.enablePlayBtn();
  });

  // -----------------------------------------------------
  // Sparnatural init
  // -----------------------------------------------------
  sparnatural.addEventListener("init", () => {
    // Config plugins YASR
    for (const plugin in yasr.plugins) {
      yasr.plugins[plugin]?.notifyConfiguration?.(
        sparnatural.sparnatural.specProvider
      );
    }

    historyComponent.notifyConfiguration(sparnatural.sparnatural.specProvider);

    // =====================================================
    // LOAD QUERY FROM URL (?query=...)
    // =====================================================
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("query")) {
      const compressedJson = urlParams.get("query");
      const compressCodec = JsonUrl("lzma");

      compressCodec.decompress(compressedJson).then((json) => {
        const queryJson = JSON.parse(json);

        // Load Sparnatural query
        sparnatural.loadQuery(queryJson);

        // Disable submit while executing
        sparnatural.disablePlayBtn();

        // Expand SPARQL in YASQE
        yasqe.setValue(
          sparnatural.expandSparql(
            sparnatural.sparnatural.queryBuilder.buildQuery(queryJson)
          )
        );

        // Execute SPARQL
        sparnatural.executeSparql(
          yasqe.getValue(),
          (finalResult) => {
            yasr.setResponse(finalResult);
            sparnatural.enablePlayBtn();
          },
          (error) => {
            console.error("Error executing SPARQL from shared URL");
            console.error(error);
            sparnatural.enablePlayBtn();
          }
        );
      });
    }
  });

  // -----------------------------------------------------
  // Query updated
  // -----------------------------------------------------
  sparnatural.addEventListener("queryUpdated", (event) => {
    yasqe.setValue(sparnatural.expandSparql(event.detail.queryString));
    lastQueryJson = event.detail.queryJson;

    for (const plugin in yasr.plugins) {
      yasr.plugins[plugin]?.notifyQuery?.(event.detail.queryJson);
    }
    // save query
    document.getElementById("query-json").value = JSON.stringify(
      event.detail.queryJson
    );
  });

  // -----------------------------------------------------
  // Submit
  // -----------------------------------------------------
  sparnatural.addEventListener("submit", () => {
    sparnatural.disablePlayBtn();
    yasqe.query();
    if (lastQueryJson) {
      historyComponent.saveQuery(lastQueryJson);
    }
  });

  // -----------------------------------------------------
  // Toggle SPARQL
  // -----------------------------------------------------
  document.getElementById("sparql-toggle")?.addEventListener("click", (e) => {
    e.preventDefault();
    const yasqeEl = document.getElementById("yasqe");
    yasqeEl.style.display = yasqeEl.style.display === "none" ? "block" : "none";
    yasqe.refresh();
  });

  // -----------------------------------------------------
  // Share
  // -----------------------------------------------------

  document.getElementById("share").onclick = function () {
    const compressCodec = JsonUrl("lzma");

    compressCodec
      .compress(document.getElementById("query-json").value)
      .then((result) => {
        let url = window.location.pathname + "?query=" + result;

        const link = document.getElementById("share-link");
        link.href = url;
        link.textContent = "Requête Garance";

        new bootstrap.Modal(document.getElementById("shareModal")).show();
      });
  };

  // -----------------------------------------------------
  // Export
  // -----------------------------------------------------
  document.getElementById("export").onclick = function () {
    var jsonString = JSON.stringify(
      JSON.parse(document.getElementById("query-json").value),
      null,
      2
    );
    $("#export-json").val(jsonString);
    $("#exportModal").modal("show");
  };

  // -----------------------------------------------------
  // Import
  // -----------------------------------------------------
  document.getElementById("import")?.addEventListener("click", (e) => {
    e.preventDefault();
    new bootstrap.Modal("#importModal").show();
  });

  document.getElementById("importButton")?.addEventListener("click", () => {
    const json = JSON.parse(document.getElementById("import-json").value);
    sparnatural.loadQuery(json);
  });
  // -----------------------------------------------------
  // History load → Sparnatural
  // -----------------------------------------------------
  historyComponent?.addEventListener("loadQuery", (event) => {
    const query = event.detail.query;
    sparnatural.loadQuery(query);
  });

  // -----------------------------------------------------
  // History button
  // -----------------------------------------------------
  document.getElementById("myCustomButton")?.addEventListener("click", () => {
    historyComponent.openHistoryModal();
  });

  const select = document.getElementById("select-examples");
  if (!select) return;

  queries.forEach((q, index) => {
    const label =
      lang === "fr" ? q.label_fr || q.label_en : q.label_en || q.label_fr;

    const option = document.createElement("option");
    option.value = index;
    option.textContent = label;

    select.appendChild(option);
    sampleQueries.push(q);
  });

  document
    .getElementById("select-examples")
    ?.addEventListener("change", (e) => {
      const index = e.target.value;

      if (index === "none") return;
      if (!sampleQueries[index]) return;

      const query = sampleQueries[index].query;

      sparnatural.loadQuery(query);
    });
});
