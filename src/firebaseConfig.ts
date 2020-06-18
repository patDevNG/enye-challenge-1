import firebase from 'firebase';
import 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();
const firebaseConfiguration ={
    apiKey: 'AIzaSyBEB7Hcqwsy5p0Q9w1Fs_3z6k8L_nYOqfY',
    authDomain: 'okuns-enye-challenge1.firebaseapp.com' ,
    databaseURL:'https://okuns-enye-challenge1.firebaseio.com',
    projectId: 'okuns-enye-challenge1',
    storageBucket:'okuns-enye-challenge1.appspot.com',
    messagingSenderId:' 834991652740' ,
    appId:' 1:834991652740:web:a53e80fddb2944008ae7d1',
    measurementId:' G-RRSHZJSWR',
};
firebase.initializeApp(firebaseConfiguration);

export default firebase