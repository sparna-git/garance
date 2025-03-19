
  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }


  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 20
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {      
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * reads a URL parameter
   **/
  const urlParam = function(name){
      var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
      if(results == null) { return null; }
      return results[1] || 0;
  }

  const getLocale = function(defaultLang, pageLang, urlLang) {
    var locale;
    if(pageLang != '') {
        locale = pageLang;
    } else if(urlLang != null) {
        locale = urlLang;
    } else {
        locale = defaultLang
    }

    return locale;
  }

  const triggerI18n = function(locale, enTranslations, frTranslations) {
    $.i18n( { locale: locale } );  
    $.i18n().load({
        'en': enTranslations,
        'fr': frTranslations
    }).done( function() { 
        $('body').i18n();
    }); 
  }

  const triggerAnchors = function() {
    anchors.options.placement = 'left';
    anchors.options.icon = '#';
    anchors.add('h5');
  }

  const adaptPagesHrefLocale = function(locale) {
    const aTags = document.querySelectorAll('a') 
    // console.log("replacing locale in links "+locale)
    // console.log("../../fr/vocabularies".replace(/(en|fr)\//g, locale+"/"))
    aTags.forEach(aTag => {
      if(aTag.href && aTag.id != "switchLang") {
        aTag.href = aTag.href.replace(/\/(en|fr)\//g, "/"+locale+"/")
      }
    })
  }
