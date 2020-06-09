export type Location ={
    lat: number,
    lng: number, 
}
export type hospitalData = {
    id: string,
    name: string,
    vicinity: string,
    rating: number,
    location: Location,
}

export type Params = {
    baseLocation: Location,
    hospitalLocation: Location,
}