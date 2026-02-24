import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic2FydGFqMTIxMiIsImEiOiJjbWZ3OTVhZHEwNmp3MmtzN3A5dmwxNWp4In0.iQ27uu5bRTqSmgyp1HV-7Q";

export default function MapboxMap({ serviceAreas = [], singleArea = null, height = "500px" }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(() => {
    if (map.current) return;  

    const center = singleArea
      ? singleArea.location.coordinates
      : serviceAreas.length
      ? serviceAreas[0].location.coordinates
      : [77, 20]; // default center [lng, lat]

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: singleArea ? 13 : 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, [serviceAreas, singleArea]);

  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;

    function updateSourcesAndLayers() {
      // Remove existing layers and sources safely
      ["serviceAreasCircles", "serviceAreasPoints"].forEach((id) => {
        if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
        if (mapInstance.getSource(id)) mapInstance.removeSource(id);
      });

      const areasToShow = singleArea ? [singleArea] : serviceAreas;

      const geojsonPoints = {
        type: "FeatureCollection",
        features: areasToShow.map((area) => ({
          type: "Feature",
          properties: {
            address: area.address,
            radiusKm: area.deliveryRadius,
          },
          geometry: {
            type: "Point",
            coordinates: area.location.coordinates,
          },
        })),
      };

      if (mapInstance.getSource("serviceAreasPoints")) {
        mapInstance.getSource("serviceAreasPoints").setData(geojsonPoints);
      } else {
        mapInstance.addSource("serviceAreasPoints", {
          type: "geojson",
          data: geojsonPoints,
        });
        mapInstance.addLayer({
          id: "serviceAreasPoints",
          type: "circle",
          source: "serviceAreasPoints",
          paint: {
            "circle-radius": 8,
            "circle-color": "#007cbf",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
          },
        });
      }

      const circleFeatures = areasToShow.map((area) =>
        turf.circle(area.location.coordinates, area.deliveryRadius || 5, {
          steps: 64,
          units: "kilometers",
          properties: { address: area.address },
        })
      );

      const geojsonCircles = {
        type: "FeatureCollection",
        features: circleFeatures,
      };

      if (mapInstance.getSource("serviceAreasCircles")) {
        mapInstance.getSource("serviceAreasCircles").setData(geojsonCircles);
      } else {
        mapInstance.addSource("serviceAreasCircles", {
          type: "geojson",
          data: geojsonCircles,
        });
        mapInstance.addLayer({
          id: "serviceAreasCircles",
          type: "fill",
          source: "serviceAreasCircles",
          paint: {
            "fill-color": "#007cbf",
            "fill-opacity": 0.2,
          },
        });
      }

      // Popup on marker click
      mapInstance.on("click", "serviceAreasPoints", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["serviceAreasPoints"],
        });
        if (!features.length) return;
        const feature = features[0];
        new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(
            `<strong>${feature.properties.address}</strong><br/>Delivery radius: ${feature.properties.radiusKm} km`
          )
          .addTo(mapInstance);
      });

      mapInstance.on("mouseenter", "serviceAreasPoints", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", "serviceAreasPoints", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }

    if (mapInstance.isStyleLoaded()) {
      updateSourcesAndLayers();
    } else {
      mapInstance.once("styledata", updateSourcesAndLayers);
    }
  }, [serviceAreas, singleArea]);

  return <div ref={mapContainer} style={{ width: "100%", height }} />;
}
