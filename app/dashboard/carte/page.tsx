"use client";
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css"
import { circle, marker } from 'leaflet';

// const Component = () => (
//     <FeatureGroup>
//         <EditControl
//             position='topright'
//             onEdited={this._onEditPath}
//             onCreated={this._onCreate}
//             onDeleted={this._onDeleted}
//             draw={{
//                 rectangle: false
//             }}
//         />
//         <Circle center={[51.51, -0.06]} radius={200} />
//     </FeatureGroup>
// );

export default function Map() {
    const _onCreate = () => {
        console.log("Created");
    }
    const _onEdited = () => {
        console.log("Edited");
    }
    const _onDeleted = () => {
        console.log("Deleted");
    }


    return (
        <MapContainer center={[45.757704, 4.834099]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FeatureGroup>
                <EditControl
                position="topright"
                onCreated={_onCreate}
                onEdited={_onEdited}
                onDeleted={_onDeleted}
                draw={{
                    rectangle: false,
                    polyline: false,
                    circle: circle,
                    circlemarker: marker,
                    marker: false,
                }}/>
            </FeatureGroup>
            <Marker position={[45.757704, 4.834099]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    );
}
