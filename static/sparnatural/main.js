document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------------------------
  // References
  // -----------------------------------------------------
  const sparnatural = document.querySelector("spar-natural");
  const historyComponent = document.querySelector("sparnatural-history");

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
  delete Yasr.plugins["table"];

  const yasr = new Yasr(document.getElementById("yasr"), {
    pluginOrder: ["Grid", "TableX", "response"],
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
    for (const plugin in yasr.plugins) {
      yasr.plugins[plugin]?.notifyConfiguration?.(
        sparnatural.sparnatural.specProvider
      );
    }

    historyComponent.notifyConfiguration(sparnatural.sparnatural.specProvider);
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
    var compressCodec = JsonUrl("lzma");
    compressCodec
      .compress(document.getElementById("query-json").value)
      .then((result) => {
        var url = window.location.pathname;
        url += "?query=" + result;
        $("#share-link").text(url);
        $("#share-link").attr("href", url);
        $("#shareModal").modal("show");
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
});
