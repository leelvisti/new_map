import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import * as mapboxgl from "mapbox-gl";
import settings from "./settings.json";
import custom from "./custom-style.json";

let map;
let hovered;
const popup = document.querySelector("#popup");

async function init() {
    const neighborhoods = await import("../data/output.json");
    const style = map.getStyle();

    style.sources = {
        ...style.sources,
        ...custom.sources
    };
    style.layers.push(...custom.layers);
    map.setStyle(style);

    map.getSource("neighborhoods").setData(neighborhoods)

    initPopup();
    initLegend();
    initHelper();
}

mapboxgl.accessToken = settings.accessToken;
map = new mapboxgl.Map(settings);
map.on("load", init);

// initialize popup display about neighborhood when hovering
const initPopup = () => {
    const nameEl = popup.querySelector(".name");
    const countEl = popup.querySelector(".count");

    map.on("mousemove", "neighborhoods-fill", (e) => {
        clearHover();
        if (e.features.length > 0) {
            hovered = e.features[0];
            map.setFeatureState(hovered, {
                hover: true
            });
            popup.style.display = "block";
            nameEl.textContent = hovered.properties.name;
            countEl.textContent = hovered.properties.count;
        }
    });

    map.on("mouseleave", "neighborhoods-fill", clearHover);
}

// remove hover information
const clearHover = () => {
    if (hovered) {
        map.setFeatureState(hovered, {
            hover: false
        });

        hovered = null;
    }

    popup.style.display = "none";
}

// populate legend
const initLegend = () => {
    const legend = document.querySelector("#legend");
    const template = document.querySelector("#legend-entry");
    const fillColorStyle = map.getPaintProperty("neighborhoods-fill", "fill-extrusion-color");
    
    let total = 0;

    fillColorStyle.splice(0, 2);

    for (let i = 0; i < fillColorStyle.length; i += 2) {
        const entry = document.importNode(template.content, true);
        const spans = entry.querySelectorAll("span");
        const color = fillColorStyle[i];

        spans[0].style.backgroundColor = color;

        if (i === fillColorStyle.length - 1) {
            spans[1].textContent = `>=${total}`;
        } else {
            spans[1].textContent = `${total}-${fillColorStyle[i + 1]}`;
            total = fillColorStyle[i + 1];
        }

        legend.appendChild(entry);
    }
}

// initialize tooltip about how to manipulate map
const initHelper = () => {
    const helper = document.querySelector("#helper");
    const helperSpans = helper.querySelectorAll("span");
    const helperIcon = helperSpans[0];

    helperIcon.onclick = () => {
        const helperState = helperSpans[1].style.visibility;
        helperSpans[1].style.visibility = helperState === 'visible'
            ? 'hidden'
            : 'visible';
    }
}
