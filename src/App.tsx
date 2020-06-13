import React, { useState, useEffect,} from "react";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";

import {List, Slider, Col, Row, Typography, Space, notification, Spin, Button, AutoComplete } from 'antd';
import { CarFilled, StarFilled } from '@ant-design/icons';

import "@reach/combobox/styles.css";
import "./index.css";

import { calculateDistance, cleanUpData } from './utils/helper'
import { hospitalData, SearchHistory } from './types';

import { optionValues } from './utils/values';
import Item from "antd/lib/list/Item";


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
    
    // const {
    //     ready,
    //     value,
    //     suggestions: {status, data},
    //     setValue,
    //     clearSuggestions
    // } = usePlacesAutocomplete();
    const [radius, setRadius] = useState<number>(4000);
    const [baseLocation, setBaseLocation] = useState({
        lat: 0,
        lng: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSearchHistory, setIsLoadingSearchHistory] = useState(false);
    const [address, setAddress] = useState('');
    const [name, setName] = useState('hospital');
    const [val, setValue] = useState('')
    const [hospitals, setHospitals] = useState<hospitalData[]>([]);
    const [searchHistory,setSearchHistory] = useState<SearchHistory[]>([])
    const { lat, lng } = baseLocation;

    const dataToSend = {
        lat,
        lng,
        radius,
        address, 
        name,
    }

    useEffect(() => {

        const fetchHospital = async () => {
            const parameter: RequestInit = {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(dataToSend),
            } 
            
            try {
            setIsLoading(true);
            const response = await fetch('https://us-central1-okuns-enye-challenge1.cloudfunctions.net/api', parameter);
            console.log(response);
            const res = await response.json();
            

            console.log(res, 'res')
            if(res.status === 'OK') {
                const hospitalResults = cleanUpData(res.results);
                setHospitals(hospitalResults);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                notification.error({
                    message: 'Error',
                    description: res.error_message
                });
            }

            } catch (error) {
                setIsLoading(false);
                notification.error({
                message: 'Error',
                description: 'Could not fetch data from google. try again'
              });
            }
        }

        if (lat && lng && radius && name) {
            fetchHospital();
        }

    }, [lat, lng, radius,name]);

    useEffect(()=>{
        const handleSearchHistory = async()=>{
            const parameter: RequestInit = {
                method: 'GET',
                mode: 'cors',
            } 
            const url =`http://localhost:5001/okuns-enye-challenge1/us-central1/api`;
            try {
                setIsLoadingSearchHistory(true);
               const response = await fetch('https://us-central1-okuns-enye-challenge1.cloudfunctions.net/api',parameter);
               const res = await response.json(); 
               
               if(res.status === 200){
                   setIsLoadingSearchHistory(false)
                setSearchHistory(res.data);
            
               }
            } catch (error) {
                setIsLoadingSearchHistory(false);
               console.log(error)
               notification.error(
                  {
                    message:"error",
                    description:'Something went wrong, try again'
                  }
               ) 
            }
        }
        handleSearchHistory();
    },[])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value)
        // if(e.target.value.toLowerCase() ==='hospital'||e.target.value.toLowerCase() ==='clinics'|| e.target.value.toLowerCase() ==='pharmacy'|| e.target.value.toLowerCase() ==='medical office'){
        //     setAddress(e.target.value)
        //     handleUserLocation();
        //     setName(e.target.value);
        //     clearSuggestions();
        // }else{
        //     // setValue(e.target.value);
        //     setName('hospital')
        // }
    };
    
    const handleChange= (sliderValue: any) =>{
        setRadius(sliderValue * 1000)
    }

    const handleSelect = async (val: string): Promise<void> => {
        try {
            // setValue(val, false);
            // const results = await getGeocode({address: val});
            // setAddress(val);
            handleUserLocation();
                // const {lat, lng} = await getLatLng(results[0]);
                console.log(lat,lng);
                setName(val);
                setAddress(val);
                setValue(val)
            //     setBaseLocation({
            //         lat,
            //         lng
            // })
           
        } catch (error) {
            notification.error({
                message: 'Error fetching data from google',
                description: 'Something went wrong'
              });
        } 
    };
   

    // const renderSuggestions = (): JSX.Element => {
    //     const possiblePlaces = data.map(({id, description}: any) => (
    //         <ComboboxOption key={id} value={description}/>
    //     ));

    //     return (
    //         <>
    //             {possiblePlaces}
    //         </>
    //     );
    // }; 
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
                    pageSize: 3,
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
                          <IconText icon={<CarFilled style = {{color: 'green'}} />} text={`${formatter(distance)}`} key="list-vertical-like-o" />,
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
   
    const handleUserLocation =() =>{
        navigator.geolocation.getCurrentPosition((position:Position)=>{
            setBaseLocation({
                lat:position.coords.latitude,
                lng:position.coords.longitude,
            })
            console.log(baseLocation)
        }, (error:any)=>{
            return notification.error({
                message:"Error loading your loacation,",
                description:error.message
            })
        },
        );
    }
    
    

    const renderSeachHistory = (): false | JSX.Element =>{
        if(isLoadingSearchHistory ==true){
          return  (
            <div className='d-flex justify-content-center mt-4'>
            <Spin className='text-center' size='large'/>
        </div>
          )
        }else{
            return( searchHistory.length > 0 && <List
                itemLayout="vertical"
                // pagination={{
                //     pageSize: 5,
                //   }}
                dataSource={searchHistory}
                renderItem={item => {
                    const { createdAt, lat,lng, name, address } = item;
                   
    
                    return (
                        <List.Item
                        actions={[
                        //   <IconText icon={<StarFilled style={{color: 'gold'}} />} text={rating.toFixed(1)} key="list-vertical-star-o" />,
                        //   <IconText icon={<CarFilled style = {{color: 'green'}} />} text={`${formatter(distance)}`} key="list-vertical-like-o" />,
                        ]}>
                          <List.Item.Meta 
                            title= {<a onClick= {(e)=>{handleSearchCLick(e,lat,lng,name,address)}}>{address}</a>}
                            description={createdAt}/>
                        </List.Item>
                      )
                } }
            />
            );
        }
        
    }
        const handleSearchCLick = (event: React.MouseEvent<HTMLElement>, lat:number, lng:number,name:string, address:string):any=>{
        event.preventDefault();
        setRadius(4000);
            setBaseLocation({
                lat:lat,
                lng:lng
            });
            setAddress(address);
            setName(name);

           
        }
        const searchOptions = [
            { value: 'hospital' },
            { value: 'clinics' },
            { value: 'pharmacy' },
            { value: 'medical office' }
          ];
          const handleInputChange = (data: string) => {
            setValue(data);
          };
          const clearSearchBox =()=>{
              if(val !== ''){
                  setValue('');
              }
          }
          const Complete: React.FC = () => (
            <AutoComplete 
              style={{ width: 500 }}
              value={val}
              options={searchOptions}
              onSelect ={handleSelect}
              onChange ={handleInputChange}
              onClick ={clearSearchBox}
            //   oclnChange ={handleInput}
              placeholder=" Search for 'hospitals', 'pharmacy','clinics', 'medical office'"
              filterOption={(inputValue, option:any) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          );
    return ( 
        <div className="container">
            <Row justify='space-between'gutter={[32,32]}>
            <Col sm={24} md={20} lg={16}>
                
                <Typography.Title className='mt-4 ' level={2}>
                    Stay Safe, Stay Calm
                </Typography.Title>
                

                <div className='my-2 '>
                    <Combobox onSelect={handleSelect} >
                        <ComboboxInput className ="input" placeholder='Search for the hospitals, medical offices,pharmacy and clinics near you...'
                            style={{ width: 500, maxWidth: "90%" }}
                            value={val}
                            onChange={handleInput}
                            selectOnClick = {true}
                            // disabled={!ready}
                            
                        />
                        <ComboboxPopover>
                            <ComboboxList>
                                <ComboboxOption value='pharmacy'/>
                                <ComboboxOption value='hospital'/>
                                <ComboboxOption value='clinics'/>
                                <ComboboxOption value='medical office'/>
                            </ComboboxList>
                        </ComboboxPopover>
                    </Combobox>
                    {/* <Complete/> */}
                </div>

                {/* <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Please choose facility"
                    defaultValue={['hospital']}
                    onChange={handleMultipleSelect}
                >
                    {renderSelectOptions()}
                </Select>  */}

                <div >
                   <p className='mr-3'>  Choose range in km:</p>
                   <Slider style={{ width: 250 }} onChange={handleChange} tipFormatter={formatter} min={4} max={20} step={1} />   
                </div>
                
                {renderList()}

            </Col>
            <Col lg={8} className ='mt-5'>
                
                <Typography.Title level={1}>Search History</Typography.Title>
                {renderSeachHistory()}
            </Col>
        </Row> 
        </div>
        
    );
}
export default App;


