import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from '@react-native-firebase/auth';
import { getFirestore,
  collection,
  doc,
  getDoc,
  setDoc, Timestamp} from '@react-native-firebase/firestore';
import {getApp, initializeApp} from '@react-native-firebase/app'
import storage from '@react-native-firebase/storage'

  const firebaseApp = getApp();
  
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  // const storage = getStorage(firebaseApp)

//   import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';

  export {auth, firestore, storage};