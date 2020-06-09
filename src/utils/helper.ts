
import { Params } from '../types'

export const calculateDistance = (params: Params) => {
    let dist = 0;
    const { baseLocation, hospitalLocation } = params;
    
    const { lat: lat1, lng: lng1 } = baseLocation;
    const { lat: lat2, lng: lng2 } = hospitalLocation;



    if( lat1 === lat2 && (lng1 === lng2) ) {
        return 0;
    } else {
        const radLat1 = Math.PI * lat1/180;
        const radLat2 = Math.PI * lat2/180;
        const theta = lng1 - lng2;
        const radtheta = Math.PI * theta/180;
        
        const radLatitude = Math.sin(radLat1) * Math.sin(radLat2);
        const radLongitude = Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radtheta);

        dist =  radLatitude + radLongitude;

        if (dist > 1) {
            dist = 1
        } else {
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515 * 1.609344;
            dist = parseFloat(dist.toFixed(1));
        }
        return dist;
    }
}

export const cleanUpData = (data: any) => {
    return data.map((googleData: any) => {
        const {id , name, vicinity, rating, geometry } = googleData;
        return {
            id,
            name,
            vicinity,
            rating,
            location: geometry.location,
        }
    })
}