//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyCEhsR2e4IYOR2GiChRG2IWIYyyGchCXy0",
    authDomain: "comp-1800-2024.firebaseapp.com",
    projectId: "comp-1800-2024",
    storageBucket: "comp-1800-2024.appspot.com",
    messagingSenderId: "643274140421",
    appId: "1:643274140421:web:076a8b848775293eaae56c"
  };

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
