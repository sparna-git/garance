---
layout: voc.njk
pagination:
    data: metadata.voc.graph
    size: 1
    alias: vocabulary_en
permalink: "/{{ locale }}/voc/{{ vocabulary_en.id | notation }}/"
---

{% set jsonScheme = metadata.voc["@context"] | json %}

<main id="ConceptScheme">
  <!-- Header -->
  <div class="row">
    <div class="col-md">
        <h1 class="ConceptScheme-title">{{ vocabulary_en.dctitle | label('fr') | title | capitalize }}</h1>
    </div>
    <!-- URI -->
    <p class="concept-URI">
        <code >
            <a href="{{ jsonScheme | getURL(vocabulary_en.id) }}">{{ jsonScheme | getURL(vocabulary_en.id) }}</a>
        </code>          
    </p>
    <!-- Description -->
    <p>{{ vocabulary_en.dcdescription | label('fr') | title }}</p>
    <br>
  </div>
  <hr>
  
  <!-- Liste de concepts -->
  <div id="Concepts">
    <div class="row">
      <div class="col-md">
        <ul>
          {% for concepts in vocabulary_en.inverse_inScheme %}
            <li><a href="/garance/{{ page.url }}concept/{{ concepts.id | notation }}">{{ concepts.prefLabel | label('fr') }}</a></li>
          {% endfor %}
        <ul>
      </div>
    </div>  
  </div>
</main>