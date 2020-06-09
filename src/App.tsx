import * as React from "react";
import { useState} from "react";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";

import {Layout,Select, Radio  } from 'antd';

import "@reach/combobox/styles.css";
import "./index.css";



const { Content, Footer} = Layout;

type RadioChangeEvent ={
   target:any;
}

export default function App() {
    const {
        ready,
        value,
        suggestions: {status, data},
        setValue
    } = usePlacesAutocomplete();
    const [radius, setRadius] = useState<string | number>(5000);
    const [lng, setLng] = useState(0);
    const [lat, setLat] = useState(0);
    
    const [hospitals, setHospitals] = useState([{
        "id": "",
        "name": "",
        "vicinity": ""
        }]);
        
    const fetchHospitals = () => {
        return fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&types=health&name=hospital&key=AIzaSyDCW5rzr4U74HaraNeNF04HKjFQgG3z_5o`).then(response => response.json());
    };

    React.useEffect(() => {
        fetchHospitals().then(hospital => setHospitals(hospital.results));
    }, [fetchHospitals]);
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value);
    };
    
    const handleChange= (e:  RadioChangeEvent): void =>{
        setRadius(e.target.value)
        console.log(radius);
        
    }

    const handleSelect = (val: string): void => {
        setValue(val, false);

        getGeocode({address: val})
            .then(results => getLatLng(results[0]))
            .then(({lat, lng}) => {
                console.log('Resolved address to Latitute and Longitude', {lat, lng});
                setLat(lat);
                setLng(lng);
            }).catch(error => {
            console.log('Error: ', error)
        });
    };

    const renderSuggestions = (): JSX.Element => {
        const possiblePlaces = data.map(({id, description}: any) => (
            <ComboboxOption key={id} value={description}/>
        ));

        return (
            <>
                {possiblePlaces}
              
            </>
        );
    };
   
   
     
    return (
        
     
     
      <Layout>
      <Content >
          <div className="main-area">
          <div className="App">
            <div className="search-area">
                <h1 className="search-title">Stay Calm, Stay Safe</h1>
            <h1 className="title">Search for the nearest hospital </h1>
        
            
               <Combobox onSelect={handleSelect} >
                <ComboboxInput className ="input"
                    style={{ width: 500, maxWidth: "90%" }}
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                />
                <ComboboxPopover>
                    <ComboboxList>{status === "OK" && renderSuggestions()}</ComboboxList>
                </ComboboxPopover>
            </Combobox>
            
          <div radius-text> Select Radius    
          <Radio.Group onChange={handleChange} value={radius}  buttonStyle="solid" defaultValue ={5000}>
        <Radio.Button value={5000}>5KM</Radio.Button>
        <Radio.Button value={10000}>10KM</Radio.Button>
        <Radio.Button value={15000}>15KM</Radio.Button>
        <Radio.Button value={50000}>50KM</Radio.Button>
      </Radio.Group>
      </div>

       
            <ul>
                {hospitals.map(item => (
                    <div className = "list-display">
                        <div key={item.id}>
                        <h3>{item.name}</h3>
                        <address>{item.vicinity}</address>
                        
                    </div>
                    </div>
                ))}
            </ul>
           


            </div>
          
        </div>
          </div>
      </Content>
      </Layout>
        
      
    );
}


