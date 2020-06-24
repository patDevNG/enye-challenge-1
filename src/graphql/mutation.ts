import {gql} from 'apollo-boost';
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