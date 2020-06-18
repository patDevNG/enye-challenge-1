import {gql} from 'apollo-boost';

const ROOT = gql`
mutation(
      $lat: Float
      $lng: Float
      $radius: Float
      $name: String
      $address: String
      $userId: ID!
){
    root(
        lat: $lat
        lng:$lng
        radius:$radius
        name:$name
        address: $address
        userId: $userID
    ){
        name
        vicinity
        rating
        geometry {
            location{
                lat
                lng
            }
        }  
    }
}
`

const HISTORY = gql`
query(
    $id: ID!
){
    history(
        id: $id
    ){
        name
        lat
        lng
        address
        url
        createdAt
        user

    }
}
`
export {HISTORY}