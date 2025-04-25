/**
 * Easy selector helper function
 */
const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  } else {
    return document.querySelector(el);
  }
};

/**
 * Easy event listener function
 */
const on = (type, el, listener, all = false) => {
  let selectEl = select(el, all);
  if (selectEl) {
    if (all) {
      selectEl.forEach((e) => e.addEventListener(type, listener));
    } else {
      selectEl.addEventListener(type, listener);
    }
  }
};

/**
 * Easy on scroll event listener
 */
const onscroll = (el, listener) => {
  el.addEventListener("scroll", listener);
};

/**
 * Scrolls to an element with header offset
 */
const scrollto = (el) => {
  let header = select("#header");
  let offset = header.offsetHeight;

  if (!header.classList.contains("header-scrolled")) {
    offset -= 20;
  }

  let elementPos = select(el).offsetTop;
  window.scrollTo({
    top: elementPos - offset,
    behavior: "smooth",
  });
};

/**
 * Back to top button
 */
let backtotop = select(".back-to-top");
if (backtotop) {
  const toggleBacktotop = () => {
    if (window.scrollY > 100) {
      backtotop.classList.add("active");
    } else {
      backtotop.classList.remove("active");
    }
  };
  window.addEventListener("load", toggleBacktotop);
  onscroll(document, toggleBacktotop);
}

/**
 * reads a URL parameter
 **/
const urlParam = function (name) {
  var results = new RegExp("[\\?&amp;]" + name + "=([^&amp;#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  }
  return results[1] || 0;
};

const getLocale = function (defaultLang, pageLang, urlLang) {
  if (urlLang != null) {
    console.log("storing cookie to " + urlLang);
    document.cookie = "lang=" + urlLang + ";path=/";
  } else {
    // maybe we have a cookie ?
    const langCookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1];
    if (langCookieValue) {
      console.log("reading cookie : " + langCookieValue);
      urlLang = langCookieValue;
    }
  }

  var locale;
  if (pageLang != "") {
    locale = pageLang;
  } else if (urlLang != null) {
    locale = urlLang;
  } else {
    locale = defaultLang;
  }

  return locale;
};

const triggerI18n = function (locale, enTranslations, frTranslations) {
  $.i18n({ locale: locale });
  $.i18n()
    .load({
      en: enTranslations,
      fr: frTranslations,
    })
    .done(function () {
      $("body").i18n();
      initTooltips(locale);
    });
};

const triggerAnchors = function () {
  anchors.options.placement = "left";
  anchors.options.icon = "#";
  anchors.add("h5");
};

const adaptPagesHrefLocale = function (locale) {
  const aTags = document.querySelectorAll("a");
  // console.log("replacing locale in links "+locale)
  // console.log("../../fr/vocabularies".replace(/(en|fr)\//g, locale+"/"))
  aTags.forEach((aTag) => {
    // check for functions in href in d3 tree
    if (aTag.href && aTag.href.replace && aTag.id != "switchLang") {
      aTag.href = aTag.href.replace(/\/(en|fr)\//g, "/" + locale + "/");
    }
  });

  // special client-side language switch
  const switchLang = document.querySelectorAll("#switchLangClient");
  if (switchLang[0]) {
    if (locale == "en") {
      // if client is in english we propose to swicth to french
      switchLang[0].href = switchLang[0].href.replace(/=en/g, "=fr");
      switchLang[0].firstChild.src = switchLang[0].firstChild.src.replace(
        /EN\.png/g,
        "FR.png"
      );
    }
  }
};

document.querySelectorAll(".info-icon").forEach((icon) => {
  icon.addEventListener("click", function () {
    this.classList.toggle("active");
  });

  window.addEventListener("click", function (e) {
    if (
      !icon.contains(e.target) &&
      !icon.nextElementSibling.contains(e.target)
    ) {
      icon.classList.remove("active");
    }
  });
});

// Initialize tooltips with Tippy.js
function initTooltips(locale) {
  document.querySelectorAll(".info-icon").forEach((el) => {
    const tooltipContainer = el.nextElementSibling;
    if (
      !tooltipContainer ||
      !tooltipContainer.classList.contains("tooltip-html")
    )
      return;

    const content = tooltipContainer.innerHTML;

    // Créer un élément temporaire pour traduire le contenu du tooltip
    const temp = document.createElement("div");
    temp.innerHTML = content;

    // Traduire les éléments internes avec data-i18n
    $(temp)
      .find("[data-i18n]")
      .each(function () {
        const key = $(this).data("i18n");
        const translation = $.i18n(key);
        $(this).text(translation);
      });

    // Initialiser Tippy.js
    tippy(el, {
      content: temp,
      allowHTML: true,
      placement: "bottom-start",
      animation: "shift-away",
      arrow: false,
      delay: [100, 100],
      trigger: "click",
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".copy-icon-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const textToCopy = this.getAttribute("data-copy");

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const original = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check text-success"></i>';
          setTimeout(() => {
            this.innerHTML = original;
          }, 1500);
        })
        .catch((err) => {
          console.error("Erreur de copie :", err);
        });
    });
  });
});
