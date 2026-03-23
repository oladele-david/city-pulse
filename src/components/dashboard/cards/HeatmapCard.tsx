import { useRef, useEffect, useState } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox';
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import 'mapbox-gl/dist/mapbox-gl.css';

// Mock Data Generator for Dubai
const generateDubaiPoints = (count: number) => {
    const features = [];
    // Dubai approx bounds
    const minLat = 25.0;
    const maxLat = 25.3;
    const minLon = 55.1;
    const maxLon = 55.4;

    for (let i = 0; i < count; i++) {
        const lat = minLat + Math.random() * (maxLat - minLat);
        const lon = minLon + Math.random() * (maxLon - minLon);
        const severity = Math.random();
        const confidence = 0.5 + Math.random() * 0.5;

        features.push({
            type: 'Feature',
            properties: {
                id: i,
                mag: severity * confidence, // Use combined weight for heatmap
                severity: severity,
                confidence: confidence
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        });
    }
    return {
        type: 'FeatureCollection',
        features: features
    };
};

const data = generateDubaiPoints(100);

const heatmapLayer: any = {
    id: 'heatmap',
    maxzoom: 15,
    type: 'heatmap',
    paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0,
            0,
            1,
            1
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            9,
            3
        ],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            'rgb(103,169,207)',
            0.4,
            'rgb(209,229,240)',
            0.6,
            'rgb(253,219,199)',
            0.8,
            'rgb(239,138,98)',
            1,
            'rgb(178,24,43)'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            2,
            9,
            20
        ],
        // Transition from heatmap to circle layer by zoom level
        'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            1,
            15,
            0
        ]
    }
};

export const HeatmapCard = ({ className }: { className?: string }) => {
    return (
        <div className={cn("rounded-full border bg-white p-2 rounded-lg border-gray-200 shadow-md overflow-hidden flex flex-col relative group", className)}>
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div>
                    <h3 className="font-semibold text-lg text-white drop-shadow-md">Issue Density Heatmap</h3>
                </div>
                <Link to="/dashboard/map" className="pointer-events-auto">
                    <button className="bg-white/90 hover:bg-white text-primary text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm flex items-center gap-1.5">
                        <HugeiconsIcon icon={MapsLocation01Icon} className="w-3.5 h-3.5" />
                        View Live Map
                    </button>
                </Link>
            </div>
            <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden border border-border/5">
                <Map
                    initialViewState={{
                        latitude: 25.2048,
                        longitude: 55.2708,
                        zoom: 10
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    attributionControl={false}
                >
                    <Source type="geojson" data={data as any}>
                        <Layer {...heatmapLayer} />
                    </Source>
                </Map>
            </div>
        </div>
    );
};
