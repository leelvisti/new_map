import fs from "fs"
import turf from "@turf/turf"
import neighborhoods from "../data/neighborhoods.json"
import sites from "../data/sites.json"

sites.features.forEach((feature) => {
    feature.properties = {
        count: 1
    };
});

let output = turf.collect(neighborhoods, sites, "count", "count");

output = output.features.filter((feature, index) => {
    feature.id = index;
    feature.properties.count = feature.properties.count.length;
    return feature.properties.count > 0
});

output = {
    type: "FeatureCollection",
    features: output
};

output = JSON.stringify(output, null, "\t");

fs.writeFile("../data/output.json", output, (err) => {
    if (err) throw err;

    console.log("success. 👍");
});