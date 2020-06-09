import React, { useState, useEffect} from "react";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";

import {List, Slider, Col, Row, Typography, Space, notification, Spin, Statistic, Descriptions  } from 'antd';
import { CarFilled, StarFilled } from '@ant-design/icons';

import "@reach/combobox/styles.css";
import "./index.css";

import { calculateDistance, cleanUpData } from './utils/helper'
import { hospitalData } from './types';

const IconText = (params: any) => {
    const { icon, text } = params;
    return (
        <Space>
          {icon}
          {text}
        </Space>
      );
} 

const  App = () => {
    
    const {
        ready,
        value,
        suggestions: {status, data},
        setValue
    } = usePlacesAutocomplete();
    const [radius, setRadius] = useState<number>(4000);
    const [baseLocation, setBaseLocation] = useState({
        lat: 0,
        lng: 0,
    });
    const [isLoading, setIsLoading] = useState(false)
  
    const [hospitals, setHospitals] = useState<hospitalData[]>([]);

    const { lat, lng } = baseLocation;

    useEffect(() => {

        const fetchHospital = async () => {
            const parameter: RequestInit = {
                method: 'POST',
                mode: 'cors',
                body: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&types=health&name=hospital&key=AIzaSyDCW5rzr4U74HaraNeNF04HKjFQgG3z_5o`,
            } 
            try {
            setIsLoading(true);
            const response = await fetch('https://us-central1-okuns-enye-challenge1.cloudfunctions.net/api', parameter);
            console.log(response);
            
            const res = await response.json();
            console.log(res);
            
            if(res.status === 'OK') {
                const hospitalResults = cleanUpData(res.results);
                setHospitals(hospitalResults);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                notification.error({
                    message: 'Error fetching data from google',
                    description: res.error_message
                });
            }

            } catch (error) {
                setIsLoading(false);
                notification.error({
                message: 'Error fetching data from google',
                description: 'Something went wrong'
              });
            }
        }

        if (lat && lng && radius) {
            fetchHospital();
        }

    }, [lat, lng, radius]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value);
    };
    
    const handleChange= (sliderValue: any) =>{
        setRadius(sliderValue * 1000)
    }

    const handleSelect = async (val: string): Promise<void> => {
        try {
            setValue(val, false);
            const results = await getGeocode({address: val});
            const {lat, lng} = await getLatLng(results[0]);
            setBaseLocation({
                lat,
                lng
            });
        } catch (error) {
            notification.error({
                message: 'Error fetching data from google',
                description: 'Something went wrong'
              });
        } 
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
    const  formatter= (value: any): string => {
        return `${value}km`;
    }
    const renderList = (): false | JSX.Element => {
        if (isLoading) {
            return (
            <div className='d-flex justify-content-center mt-4'>
                <Spin className='text-center' size='large'/>
            </div>
            )
        } else {
            return ( hospitals.length > 0 && <List
                itemLayout="vertical"
                pagination={{
                    pageSize: 5,
                  }}
                dataSource={hospitals}
                renderItem={item => {
                    const { name, vicinity, rating, location } = item;
                    const locationsToCompare = {
                        baseLocation,
                        hospitalLocation: location,
                    }
                    const distance = calculateDistance(locationsToCompare)
    
                    return (
                        <List.Item
                        actions={[
                          <IconText icon={<StarFilled style={{color: 'gold'}} />} text={rating.toFixed(1)} key="list-vertical-star-o" />,
                          <IconText icon={<CarFilled style = {{color: 'green'}} />} text={`${distance}`} key="list-vertical-like-o" />,
                        ]}>
                          <List.Item.Meta
                            title={name}
                            description={vicinity}/>
                        </List.Item>
                      )
                } }
            />);
        }
    } 
    
    return ( 
        <Row justify='center'>
            <Col sm={24} md={20} lg={16}>
                <Typography.Title className='text-center mt-4' level={2}>
                    Stay Safe, Stay calm
                </Typography.Title>

                <div className='my-2 d-flex justify-content-center'>
                    <Combobox onSelect={handleSelect} >
                        <ComboboxInput className ="input" placeholder='Search for the hospitals near you....'
                            style={{ width: 500, maxWidth: "90%" }}
                            value={value}
                            onChange={handleInput}
                            disabled={!ready}
                        />
                        <ComboboxPopover>
                            <ComboboxList>{status === "OK" && renderSuggestions()}</ComboboxList>
                        </ComboboxPopover>
                    </Combobox>
                </div>

                <div className='d-flex justify-content-center'>
                   <p className='mr-3'>  Choose range in km:</p>
                   <Slider style={{ width: 250 }} onChange={handleChange} tipFormatter={formatter} min={4} max={20} step={1} />   
                </div>
                
                {renderList()}

            </Col>
        </Row> 
    );
}
export default App;


