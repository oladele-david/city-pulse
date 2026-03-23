import { useRef, useEffect, useState } from 'react';
import Map, { Source, Layer, MapRef, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapFilters } from './MapFilters';
import { IssueDrawer } from './IssueDrawer';
import { mockIssues, Issue } from '@/data/mockIssues';

export const LiveMapComponent = () => {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    const onMarkerClick = (issue: Issue) => {
        setSelectedIssue(issue);
    };

    return (
        <div className="relative w-full h-full bg-slate-950">
            <MapFilters isDrawerOpen={!!selectedIssue} />
            <IssueDrawer
                isOpen={!!selectedIssue}
                onClose={() => setSelectedIssue(null)}
                issue={selectedIssue}
            />

            <Map
                initialViewState={{
                    latitude: 25.2048,
                    longitude: 55.2708,
                    zoom: 11
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                attributionControl={false}
            >
                {mockIssues.map((issue) => (
                    <Marker
                        key={issue.id}
                        longitude={issue.longitude}
                        latitude={issue.latitude}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onMarkerClick(issue);
                        }}
                    >
                        <div
                            className="cursor-pointer transition-transform hover:scale-125"
                            style={{
                                width: issue.confidence * 20 + 8,
                                height: issue.confidence * 20 + 8,
                                backgroundColor:
                                    issue.severity === 'high' ? '#ef4444' :
                                        issue.severity === 'medium' ? '#f97316' : '#eab308',
                                borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.8)',
                                boxShadow: `0 0 10px ${issue.severity === 'high' ? 'rgba(239,68,68,0.5)' :
                                        issue.severity === 'medium' ? 'rgba(249,115,22,0.5)' : 'rgba(234,179,8,0.5)'
                                    }`
                            }}
                        />
                    </Marker>
                ))}
            </Map>
        </div>
    );
};
