import React, { useState, useEffect,} from "react";
import moment from 'moment';
import firebase from './firebaseConfig';

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";

import {List, Slider, Col, Row, Space, notification, Spin, Button, AutoComplete } from 'antd';
import { CarFilled, StarFilled } from '@ant-design/icons';

import "@reach/combobox/styles.css";
import "./index.css";

import { calculateDistance, cleanUpData } from './utils/helper'
import { hospitalData, SearchHistory } from './types';
import {HISTORY} from './graphql/mutation';
import {useQuery} from '@apollo/react-hooks';




const IconText = (params: any) => {
    const { icon, text } = params;
    return (
        <Space>
          {icon}
          {text}
        </Space>
      );
}

const Home=() => {
    const [radius, setRadius] = useState<number>(4000);
    const [baseLocation, setBaseLocation] = useState({
        lat: 0,
        lng: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [name, setName] = useState('hospital');
    const [val, setValue] = useState('')
    const [hospitals, setHospitals] = useState<hospitalData[]>([]);
    const [searchHistory,setSearchHistory] = useState([])
    const { lat, lng } = baseLocation;
    const [shouldFetchSearchHistory, setShouldFetchSearchHistory] = useState(false);
    const userId = (window.localStorage.getItem('uid')?.toString());
    const dataToSend = {
        lat,
        lng,
        radius,
        address, 
        name,
        userId,
    }

    const {loading,error,data,refetch} = useQuery(HISTORY,{
        variables:{
            id:userId
        }
    })
    
    useEffect(()=>{
       refetch();
    //    console.log(data)
    },[shouldFetchSearchHistory])

   const handleSavingSearch = ()=>{
       if(lat !==0 && lng !==0 && radius!==0&& name !==''){
           const db = firebase.firestore();
           db.collection('searches').add(
               {
                lat: lat,
                lng: lng,
                address: address,
                name: name,
                user: userId,
                createdAt: moment().format("LLL")
               }
           )
        //    refetch()
        setShouldFetchSearchHistory(true);
       }
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
            const url =`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&types=health&name=${name}&key=AIzaSyC08P9EaaVvSb4aqiYc8F7plZifcXCBc20`;
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const response = await fetch(proxyurl+url, parameter);
            console.log(response);
            const res = await response.json();
            

            console.log(res, 'res')
            if(res.status === 'OK') {
                handleSavingSearch();
                const hospitalResults = cleanUpData(res.results);
                setHospitals(hospitalResults);
                setShouldFetchSearchHistory(true);
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

    useEffect(() => {
        if(data && data.history) {
          setSearchHistory(data.history)
        }
      }, [data])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value)
    };
    
    const handleChange= (sliderValue: any) =>{
        setRadius(sliderValue * 1000)
    }

    const handleSelect = async (val: string): Promise<void> => {
        try {
            handleUserLocation();
                setName(val);
                setAddress(val);
                setValue(val)
        } catch (error) {
            notification.error({
                message: 'Error fetching data from google',
                description: 'Something went wrong'
              });
        } 
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
        if(loading == true){
          return  (
            <div className='d-flex justify-content-center mt-4'>
            <Spin className='text-center' size='large'/>
        </div>
          )
        }else{
            return( searchHistory.length > 0 && <List
                itemLayout="vertical"
                dataSource={searchHistory}
                renderItem={item => {
                    const { createdAt, lat,lng, name, address } = item;
                    return (
                        <List.Item>
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
    return ( 
        <div className="container">
            <Row justify='space-between'gutter={[32,32]}>
            <Col sm={24} md={20} lg={16}>
                
                <h1 className ='mt-4'> Stay Safe, Stay Calm</h1>
                

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

                <div >
                   <p className='mr-3'>  Choose range in km:</p>
                   <Slider style={{ width: 250 }} onChange={handleChange} tipFormatter={formatter} min={4} max={20} step={1} />   
                </div>
                
                {renderList()}

            </Col>
            <Col lg={8} className ='mt-5'>
                <h1>Search History</h1>
                {renderSeachHistory()}
            </Col>
        </Row> 
        </div>
        
    );
}
export default Home;