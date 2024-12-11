---
layout: voc.njk
pagination:
    data: metadata.voc.graph
    size: 1
    alias: vocabulary
permalink: "/{{ locale }}/voc/{{ vocabulary.id | notation }}/"
---

{% set jsonScheme = metadata.voc["@context"] | json %}

<main id="ConceptScheme">
  <!-- Header -->
  <div class="row">
    <div class="col-md">
        <h1 class="ConceptScheme-title">{{ vocabulary.dctitle | label('fr') | title | capitalize }}</h1>
    </div>
    <!-- URI -->
    <p class="concept-URI">
        <code >
            <a href="{{ jsonScheme | getURL(vocabulary.id) }}">{{ jsonScheme | getURL(vocabulary.id) }}</a>
        </code>          
    </p>
    <!-- Description -->
    <p>{{ vocabulary.dcdescription | label('fr') | title }}</p>
    <br>
  </div>
  <hr>
  
  <!-- Liste de concepts -->
  <div id="Concepts">
    <div class="row">
      <div class="col-md">
        <ul>
          {% for concepts in vocabulary.inverse_inScheme %}
            <li><a href="/garance/{{ page.url }}concept/{{ concepts.id | notation }}">{{ concepts.prefLabel | label('fr') }}</a></li>
          {% endfor %}
        <ul>
      </div>
    </div>  
  </div>
</main>