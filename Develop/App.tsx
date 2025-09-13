/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect, useRef, useContext} from 'react';

import type {PropsWithChildren} from 'react';
import { NavigationContainer, ThemeContext, createStaticNavigation, useNavigation, CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { HomeScreen } from './Home';
import { SecondPage } from './SecondPage';
import { ChartPage } from './ChartPage';
import {Login} from './Login'
import { SignUp } from './SignUp';
import { Onboard1 } from './Onboard1.tsx';
import { Onboard2 } from './Onboard2.tsx';
import { Payment } from './Payment.tsx';
import {imageDataType} from './StackList';
import {auth, firestore} from './Firebase.ts'
import { onAuthStateChanged, useUserAccessGroup } from '@react-native-firebase/auth';
import {collection, doc, getDoc, Timestamp, updateDoc} from '@react-native-firebase/firestore'
import 'react-native-charts-wrapper';
import { GlobalState } from './GlobalState.ts';
import {View, ActivityIndicator} from 'react-native'
import  PushNotificationIOS  from '@react-native-community/push-notification-ios';
// import Toast from 'react-native-toast-message'
import { Platform } from 'react-native';
import {format} from 'date-fns'

import {CopilotProvider} from 'react-native-copilot'
import { TooltipComponent, StepNumberComponent } from './CopilotTooltip.tsx';
import { UserDataProvider, UserData } from './UserData.tsx';
import { getSubscriptions } from 'react-native-iap';
import { withIAPContext } from 'react-native-iap';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging'
import * as RNFS from '@dr.pogodin/react-native-fs';
import {getIdToken} from '@react-native-firebase/auth';
import {isTablet} from 'react-native-device-info';


 
 
function App(): React.JSX.Element {

  const Stack = createNativeStackNavigator<RootStackParamList>();
  const [allowedAccess, setAllowedAccess] = useState<boolean | null>(null);   
  const [tookPicture, setTookPicture] = useState(false);
  const [userSignedIn, setUserSignedIn] = useState<boolean | null>(null);
  const [completedOnboard, setCompletedOnboard] = useState<boolean | null>(null);
  const [initialNavReady, setInitialNavReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  let uid = "";

  interface UserDataTypes{
    photos: imageDataType[],
    endTime: Timestamp, 
    completedOnboard: boolean,
    username: string
  }

  const navigationRef = createNavigationContainerRef();
  let userDir = '';
  let tokenPath = '';
 
  useEffect(() => {
    console.log('completedOnboard:', completedOnboard);
  }, [completedOnboard]);  

  useEffect(() => {  
    const check = onAuthStateChanged(auth, user => {
      if(user){
        console.log("Signed in");
        setUserSignedIn(true);
        GlobalState.uid = user.uid
        uid = user.uid;
        userDir = `${RNFS.DocumentDirectoryPath}/${user.uid}`;
        tokenPath = `${userDir}/tokenPath`;
      }
      else{
        setUserSignedIn(false);
      }
    })

    return () => check();
  }, [])

 
 

  
  useEffect(() => {
    
    const checkTime = async () => {
      try{

        const dbCollection = collection(firestore, 'Users'); 
        const docRef = doc(dbCollection, GlobalState.uid);
        const docSnapShot = await getDoc(docRef); 
        if(docSnapShot.exists()){
          const data = docSnapShot.data() as UserDataTypes;
          
          console.log(data?.endTime + " This is the endtime!");
          if(data?.endTime instanceof Timestamp){

            const end = data?.endTime.toDate().getTime() 
            updateTime(end)
          }
          else{
            console.log("Didn't work");
          }
        }
      }
      catch(error){
        console.log("Error: " + error);
      }
    }
    checkTime(); 
  }, [userSignedIn]);   

  const updateTime = (end: number) => {

    const interval = setInterval(() => {
          const now = Date.now();
          const diff = Math.max(0, (end - now));
          
          if(diff === 0){    
            // console.log(" This is the diff value " + diff);
            setAllowedAccess(true)
            clearInterval(interval)
            
          }
          else{
            setAllowedAccess(false);
          }  
        }, 1000)
    }

    useEffect(() => {
      
      const checkIfOnboard = async () => {
        console.log("Checking if completed onboard!");
        try{
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnapShot = await getDoc(docRef); 
 
          if(docSnapShot.exists()){
            const user = docSnapShot.data() as UserDataTypes;
            console.log(user?.completedOnboard + " onboard?")
            if(user?.completedOnboard === true){
              console.log(" Yes completed onboard is: " + user?.completedOnboard);
              setCompletedOnboard(true);
            }
            else{
              setCompletedOnboard(false);
            }
          }
        }
        catch(error){
        }
      }

      checkIfOnboard()  
    }, [userSignedIn, completedOnboard])


// Permissions for android
// async function requestNotificationPermission() {
//   if (Platform.OS === 'android') {
//     const androidVersion = Platform.Version;
//     if (androidVersion >= 13) {
//       const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   }
//   return true;
// }


    
    // Requesting the user's permission to send them notfications.
useEffect(() => {
   const requestPermissions = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL; 

      if(enabled){
        console.log("User has given permissions");
      }

    const token = await messaging().getToken();
    console.log("FCM Token:", token); 
   }

   requestPermissions();

  }, []);


  // Sending the token to the server
  const sendTokenToFirebase = async (token: string) => {
    // const idToken = await getIdToken(auth.currentUser!, true);

    // const req = await fetch("http://192.168.1.10:5001/weightwatcher-2d8cf/us-central1/notificationManager", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type" : "application/json",
    //     "Authorization": `Bearer ${idToken}`
    //   },
    //   body: JSON.stringify({tokenID: token})
    // });

    // if(req.status == 400 || req.status == 401){
    //   console.log("Invalid call!");
    //   return;
    // } 

    // if(req.status == 429){
    //   console.log("Too many calls!");
    //   return;
    // }

    // const jsonResponse = req.json();
    console.log("token sent to firebase");

    try{
    const dbCollection = collection(firestore, 'Users'); 
    const docRef = doc(dbCollection, GlobalState.uid);

    // Separate the token ids for devices.
    if(!isTablet()){
      await updateDoc(docRef, {tokenID: token});
    }
    else{
      await updateDoc(docRef, {tabletTokenID: token});
    }

    }
    catch(error){
      console.log("Firestore Error: " + error);
    }

    
  }


  // Sending the value of the token to the server to allow for Firebase to send notifications 
  // using iOS and Android's servers if it differs from the locally stored token.
  useEffect(() => {

     userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;
    tokenPath = `${userDir}/tokenPath`;
    
    if(userDir.length > 0 && tokenPath.length > 0){
    const getToken = async () => {
      
      const token = await messaging().getToken();
      console.log("Entered gettoken")
      const userDirExists = await RNFS.exists(userDir); 

      
      if(userDirExists){
        console.log("user directory already exists");
        const tokenPathExists = await RNFS.exists(tokenPath);
        if(tokenPathExists){
          console.log("token path already exists");
           const tokenObj = await RNFS.readFile(tokenPath);
           if(token !== tokenObj){
              sendTokenToFirebase(token);
           }
        }
        else{
         await RNFS.writeFile(tokenPath, token, 'utf8');
         sendTokenToFirebase(token);
        }
      }
      else{
        sendTokenToFirebase(token);
        await RNFS.mkdir(userDir);
        await RNFS.writeFile(tokenPath, token, 'utf8');
      }
    }

    getToken();

    // If there's a new token, send it to the server and update the local storage with it.
     messaging().onTokenRefresh(async (newToken) => {
      await sendTokenToFirebase(newToken);

      const userDirExists = await RNFS.exists(userDir);
      if(!userDirExists) await RNFS.mkdir(userDir);
      await RNFS.writeFile(tokenPath, newToken, 'utf8');
    });
  }

  }, [userSignedIn]) 
 
  

  // useEffect(() => {
  //   PushNotificationIOS.requestPermissions({alert: true, sound: true, badge: true}).then((permission) => {

  //     // Checking if the user took the picture and if so change took picture to true so no 
  //     // notification will be sent.
  //    const checkIfPicture = async () => {
  //       try{
  //         if(userSignedIn){
  //           console.log("Checking if the user took a picture!");
  //           const dbCollection = collection(firestore, 'Users'); 
  //           const docRef = doc(dbCollection, GlobalState.uid);
  //           const docSnap = await getDoc(docRef); 

  //           if(docSnap.exists()){
  //             const user = docSnap.data() as UserDataTypes;
  //             if(user?.photos.length > 0){
  //               const photos = user?.photos;
  //               GlobalState.dataLength = photos.length
  //               const lastPhoto = photos[photos.length - 1];

  //               // Ensuring the format is the same for accurate comparison
  //               const now = format(new Date(), 'MM/dd/yy');
                
  //               if(lastPhoto.date == now){
  //                 console.log("Already took their pictures for the day")
  //                 console.log(photos[photos.length - 1].date + " Date works")
  //                 setTookPicture(true);
  //               }
  //               else{
  //                 console.log("Hasn't taken picture");

  //                 // Stating whether the user has allowed for push notifications.
  //                 if(permission.alert){
  //                   // scheduleNotifications(user?.username);
  //                 }
  //               }
              
  //             }
  //           }
  //        }
  //       }
  //       catch(error){
  //         console.log('error ' + error);
  //       }
  //    }
 
  //     checkIfPicture();
    
  //   })
  
  // }, [userSignedIn])


  // const scheduleNotifications = (user: string) => {

  //   console.log("Schedule Notification works!");
  //   const now = new Date();
  //   const newTime = new Date();

  //   // 7:30 is the most likely time that someone would want to log weight.
  //   newTime.setHours(19, 30, 0, 0); 

  //   // Making sure that if the time has already passed then set a reminder
  //   // for the next day. So it will trigger for the next day even if they
  //   // don't open the app again.
  //   if(now > newTime){
  //     newTime.setDate(newTime.getDate() + 1);
  //   }

  //   PushNotificationIOS.addNotificationRequest({
  //     id: `${GlobalState.uid}/photoReminder`,
  //     title: 'Reminder',
  //     body: `Hey ${user}, don't forget to take your pix today!`,
  //     fireDate: newTime
  //   });
  // }


useEffect(() => {
  // setInitialRoute("Login")
  
  console.log(userSignedIn + " " + allowedAccess +  " " + completedOnboard);
  if(userSignedIn && completedOnboard){
      console.log("First is data!");
      setInitialRoute('Data');
  }
  else if(completedOnboard === false && userSignedIn){
    console.log("First is Onboard!");
   setInitialRoute('Onboard1')
  }
  else if(userSignedIn && completedOnboard === true && allowedAccess === true){
    console.log("First is Home!");
    setInitialRoute('Home') 

  }  
   else if(userSignedIn === false){ 
    console.log(" Defaulted to login");
    setInitialRoute('Login')
  }

}, [userSignedIn, completedOnboard, allowedAccess])

if(initialRoute === null){
  return( <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
        {/* Loading icon */}
         <ActivityIndicator size="large" color="#00ffff"/>
       </View>)
}  


  return(
    <UserDataProvider>
      <GestureHandlerRootView>
    <CopilotProvider>
    <NavigationContainer ref={navigationRef}> 
  <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, gestureEnabled: false }}>
    
    <Stack.Screen name="Home" component={HomeScreen}
    
    />
   
     
     <Stack.Screen name="Data" component={SecondPage}/>
     <Stack.Screen name="ChartPage" component={ChartPage}/>
     
   
        <Stack.Screen name="Onboard1" component={Onboard1}/>
        <Stack.Screen name="Onboard2" 
      //   children={(props) => (
      //     <Onboard2 {...props} setCompletedOnboard={completedOnboard}/>
      // )}
      component={Onboard2}
      /> 
      

    

     <Stack.Screen name="Login" component={Login}/>
     <Stack.Screen name="SignUp" component={SignUp}/>

    <Stack.Screen name="Payment" component={Payment}/>
  
    
   </Stack.Navigator>
    </NavigationContainer> 
    </CopilotProvider>
    </GestureHandlerRootView>
    </UserDataProvider>
    
  )
  }

export default withIAPContext(App);
