---
layout: main.njk
pagination:
    data: metadata.scheme.graph
    size: 1
    alias: cs
permalink: "{{ locale }}/conceptScheme/{{ cs.id | notation | slugify }}/"
---

{% set jsonScheme = metadata.scheme["@context"] | json %}

<main id="ConceptScheme">

  <!-- Header -->
  <div class="row">
    <div class="col-md">
        <h1 class="ConceptScheme-title">{{ cs.dctitle | Label(locale) | title | capitalize }}</h1>
    </div>
    <!-- URI -->
    <p class="concept-URI">
        <code >
            <a href="{{ jsonScheme | getURL(cs.id) }}">{{ jsonScheme | getURL(cs.id) }}</a>
        </code>          
    </p>
    <!-- Description -->
    <p>{{ cs.dcdescription | Label(locale) | title }}</p>
    <br>
  </div>
  <hr>
  
</main>

<!-- Liste de concepts -->
<div id="Concepts">
  <div class="row">
	  <div class="col-md">
      <ul>
        {% for concepts in cs.inverse_inScheme %}
          <li><a href="/{{ page.url }}concept/{{ concepts.id | notation }}">{{ concepts.prefLabel | Label(locale) }}</a></li>
        {% endfor %}
      <ul>
    </div>
  </div>  
</div>

<script>
  // generate anchors on each h5 title
  anchors.options.placement = 'left';
  anchors.options.icon = '#';
  anchors.add('h5');
</script>

<!-- d3js -->
<script type="text/javascript">
  // recuperer tous les concepts
  const data = {{ cs.inverse_inScheme | json }}
  /* THOMAS : il faut ajouter dans le tableau de data un noeud qui correspond à la racine de l'arbre à dessigner */
  const conceptScheme_Header = {"id": {{ cs.id | json }},"prefLabel":{{ cs.prefLabel | json }}}
  const title_conceptScheme = {{ cs.prefLabel | json }}
  data.push(conceptScheme_Header);

    // Specify the charts’ dimensions. The height is variable, depending on the layout.
    const width = 928;
    const marginTop = 10;
    const marginRight = 20;
    const marginBottom = 10;
    const marginLeft = 40;

    const root = d3.stratify()
      .id((d) => d.id)
      .parentId((d) => {
        if(d.broader) {
          return d.broader.id
        } else { 
          if(d.type && d.type.includes("Concept")) return data.at(-1).id;
          else return null; 
        }
      })
    (data);

    const dx = 14;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // Define the tree layout and the shape for links.
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3.select("svg")
    //.attr("width", width)
    .attr("width", "100%")
    //.attr("height", dx)
    .attr("height", "80%")
    .attr("viewBox", [-marginLeft, -marginTop, width, dx])
    //.attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");
    .attr("style", "max-width: 100%; font: 12px sans-serif;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");
  
    function update(event,source) {
        const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + marginTop + marginBottom;
        const transition = svg.transition()
            .duration(duration)
            //.attr("height", height)
            .attr("height", "80%")
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
        
        // Update the nodes…
        const node = gNode.selectAll("g")
          .data(nodes, d => d.data.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
              d.children = d.children ? null : d._children;
              update(event, d);
            });
        
        nodeEnter.append("circle")
          .attr("r", 2.5)
          .attr("fill", d => d._children ? "#555" : "#999")
          .attr("stroke-width", 10);

        const nodeRef = nodeEnter.append("a")
          .attr("href", d => "#"+d.data.notation)

        nodeRef.append("text")
            .attr("dy", "0.40em")
            //.attr("x", d => d._children ? -6 : 6)
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            // .attr("text-anchor", d => d.data.prefLabel ? "end" : "start")
            .text(d => d.data.prefLabel.filter(i => i["@language"] == "en")[0]["@value"])
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white")
            .attr("paint-order", "stroke");
        
        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
          //.data(links, d => d.target.id);
          .data(links, d => d.target.data.id.split(":")[1])

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
              const o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
            });
        
        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
              const o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }
    
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
    });

    update(null, root);

    svg.node();

</script>