import logo from './logo.svg';
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { render } from "react-dom";
import './App.css';
import About from './about.tsx';
import COSMO from './data/cosmo.json';
import CONTRAPTION from './data/contraption.json';
import CARTESIAN from './data/cartesian.json';
import SELF from './data/self.json';
import { Pincategorycosmo, Pincategorycontrap, Pincategorycartes, Pincategoryself, Pincategorygen } from './pin/pins.tsx';


import Map, { Source, Layer, FullscreenControl, Marker, Popup } from "react-map-gl";
import {
  clusterLayer, clusterCountLayer, unclusteredPointLayer,
  daedata, daestyle
} from "./layers.ts";
import "mapbox-gl/dist/mapbox-gl.css";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';


function App() {

  const [popupInfo, setPopupInfo] = useState(null);

  const contraption = useMemo(
    () =>
      CONTRAPTION.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="center"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pincategorycontrap />

        </Marker>
      )),
    []
  );

  const cosmo = useMemo(
    () =>
      COSMO.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="center"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pincategorycosmo />

        </Marker>
      )),
    []
  );

  const cartesian = useMemo(
    () =>
      CARTESIAN.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="center"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pincategorycartes />

        </Marker>
      )),
    []
  );

  const self = useMemo(
    () =>
      SELF.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="center"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pincategoryself />

        </Marker>
      )),
    []
  );

  return (

    <><div className="welcome">
      <svg width="800" height="600" stroke="white" strokeWidth="1" fill="#5c5769" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
          <path id="intermediate" d="M 50 50 C 50 250 200 500 400 500 C 600 500 750 250 750 50 " />
        </defs>
        <text>
          <textPath startOffset="50%" dominantBaseline="middle" textAnchor="middle" xlinkHref="#intermediate">COLLECTIVE RITUALS IN CARTOGRAPHY</textPath>
        </text>
      </svg>
    </div>

      <Map
        initialViewState={{
          latitude: 0,
          longitude: -18,
          zoom: 1.8
        }}
        projection={"globe"}
        mapStyle="mapbox://styles/comuni-dados/ck87kqz1v0hlt1iptdomrfl1y"
        mapboxAccessToken="pk.eyJ1IjoiY29tdW5pLWRhZG9zIiwiYSI6ImNqdWxlaHRqbjIycjE0M3BpamY3a3c4aWUifQ.HGizp_QckKQVjAZnnw8qAg"
        // onClick={onClick}
        // ref={mapRef}
        fog={{ "horizon-blend": 0.5, "star-intensity": 0.15, "range": [0.8, 8], color: "#e3e5c7", "space-color": "#a66480", "high-color": "#000000" }}
        light={{ "anchor": "viewport", "color": "white", "intensity": 0.4 }}
        style={{ width: "null", height: "92vh" }}
      >

        <FullscreenControl position="top-right" />


        {cosmo}

        {contraption}

        {cartesian}

        {self}

        {popupInfo && (
          <Popup
            anchor="center"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div className='card'>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                <div className="signL" style={{ borderColor: popupInfo.color }} >
                  {popupInfo.sign1L} <br />
                  {popupInfo.sign2L} <br />
                  {popupInfo.sign3L} <br />
                  <div style={{lineHeight:0.9}} dangerouslySetInnerHTML={{ __html: popupInfo.category }} />
                </div>
                {/* {popupInfo.city}, {popupInfo.state} |{' '}
                <a
                  target="_new"
                  href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${popupInfo.city}, ${popupInfo.state}`}
                >
                  Wikipedia
                </a> */}
              </Typography>
              <div className="cardTitle">
                <div dangerouslySetInnerHTML={{ __html: popupInfo.city }} /> <br />
                <Divider light />
                <div className="cardsubTitle" >{popupInfo.state}</div>
              </div>

              <img style={{ position: "relative", top: "20px", bottom: "20px" }} width="100%" src={popupInfo.imageCover} />
              <div className="cardContent" dangerouslySetInnerHTML={{ __html: popupInfo.description }} />
              <img style={{ position: "relative", top: "20px", bottom: "20px" }} width="100%" src={popupInfo.image} />

              <iframe controls width={"99%"} height={popupInfo.ratioCover} src={popupInfo.videoCover} frameborder="0" allow=" encrypted-media; picture-in-picture" allowFullScreen />

            </div>
          </Popup>
        )}

      </Map>

      <div className="buttons">
        <About />
      </div><div className="title-container">
        <div className="title">
          {/* https://slevinski.github.io/SuttonSignWriting/characters/symbols.html#?ui=en&set=swu https://www.signbank.org/signpuddle2.0/searchword.php?ui=12&sgn=46 Mundo, terra, planeta, Terra, Planeta, planeta-terra, globo, globo-terrestre Source: Rubens Almeida - CAS/MA (Projeto Escreva em Libras) */}
          󱽣 <sup>󻦥</sup><br />
          󱽯 <sub>󻦶</sub>
        </div>
      </div></>
  );
}

export default App;
