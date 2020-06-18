import React, { useState, useEffect,} from "react";
// import firebase from "firebase";
import firebase from './firebaseConfig'
import dotenv from 'dotenv';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import Home from "./home";
import { Button } from "antd";
dotenv.config();

// firebase.initializeApp({
//     apiKey:'AIzaSyBEB7Hcqwsy5p0Q9w1Fs_3z6k8L_nYOqfY',
//     authDomain:'okuns-enye-challenge1.firebaseapp.com',
//   })

const  App = () => {
    const [signedIn,setSignedIn] = useState(false);
    const [userId, setUserId] =useState<any>()
    const uiConfig ={
      signInFlow:"popup",
      signInOptions:[
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      callBacks:{
        signInSuccess:()=> false
      }
    }
  
    useEffect(() => {
     const handleAuth = ()=>{
     
      firebase.auth().onAuthStateChanged((user)=>{
       console.log(user?.uid);
       setUserId(user?.uid);
       window.localStorage.setItem('uid', `${user?.uid}`);
       console.log(userId);
       console.log(window.localStorage.getItem('uid'));
        setSignedIn(!!user);
        
      })
     }
     handleAuth();
      },
     []);
   const handleLogOut =(event: React.MouseEvent<HTMLElement>)=>{
     window.localStorage.clear();
    firebase.auth().signOut()
     }
     if(signedIn ===true){
        return (
          
          <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light ">
              <div className="container">
              <h5>Hospital Finder</h5>
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>
  <div className="collapse navbar-collapse " id="navbarNav">
    <ul className="navbar-nav ml-auto">
      <li className="nav-item active">
        <Button type='primary' onClick={handleLogOut}>Logout</Button>
      </li>
      
    </ul>
  </div>
              </div>

</nav>
           <div className="container">
        <Home/>
        </div>
          </div>
          );
      }else{
        return(
          <div className='auth text-align-center ml-5'>
            
          <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
          />
          </div>
        )
      }
    // return ( 
        
      
    // );
}
export default App;


