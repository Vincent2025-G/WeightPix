import {

    Alert,
    
  } from 'react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { auth, firestore } from './Firebase.ts';
import {collection, doc, getDoc, updateDoc, Timestamp} from '@react-native-firebase/firestore';
import {getIdToken} from '@react-native-firebase/auth';
import {GlobalState} from './GlobalState.ts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack'; 
import { RootStackParamList } from './StackList.ts';
import {useIAP, getReceiptIOS} from 'react-native-iap'
import React, {useState, useContext} from 'react';
import { UserData } from './UserData';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface UserDataTypes{
        expirationDate: Timestamp,
        paid: boolean;   
    }

type Prop = NativeStackNavigationProp<RootStackParamList, "Home">

export const useCheckSubscriptionInfo = () => {

const navigation = useNavigation<Prop>();
const state = navigation.getState();
const currentScreen = state.routes[state.index].name;

const {setValidSubscription} = useContext(UserData);
const userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;

const storeReceiptData = async (subInfoPath: string, expirationDate: Date = new Date(), paid: boolean) => {    
      
        // Store in Local Storage. 
        try{
            const exists = await RNFS.exists(userDir);
            if(!exists){
                await RNFS.mkdir(userDir);
            }
            const subscriptionInfo = {paid: paid, expirationDate: expirationDate};
            await RNFS.writeFile(subInfoPath, JSON.stringify(subscriptionInfo), 'utf8');
        }
        catch(error){
            console.log("Error storing in local: " + error);
        }
    } 

    // Validates the receipt either from local storage or from the database or directly from payment.
     const validateReceipt = async (receipt: string, subInfoPath: string, page: string, photoLength: number) => {
                    // Sending the idToken to verify that it's a valid user
                    const idToken = await getIdToken(auth.currentUser!, true);

                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000);
                    const result = await fetch("http://192.168.1.10:5001/weightwatcher-2d8cf/us-central1/receiptProcessor", {     
                    method: "POST", 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        receiptData: receipt, 
                    }
                    ),
                    signal: controller.signal
                    }).catch(error => {
                    const message = error?.toString() || "";

                    console.log("message: " + message);

                    if (message.includes("Abort") || message.includes("Network") || message.includes("timeout")) {
                        Alert.alert("Connection issue", "Couldn’t reach server to validate subscription. Please check your internet and try again.",
                                [
                                    {text: "Cancel", style: "cancel"},
                                    {text: "Retry", style: 'default', onPress: () => validateReceipt(receipt, subInfoPath, page, photoLength)}
                                ]);
                    } 
                    else if (message.includes("status:210")) {
                        Alert.alert("Subscription issue", "Your subscription could not be verified. Please try restoring purchases or subscribing again.");
                        storeReceiptData(subInfoPath, undefined, false);
                         return;
                    } 
                    else {
                        Alert.alert("Unexpected error", "Something went wrong while verifying your purchase.");
                        storeReceiptData(subInfoPath, undefined, false);
                         return;
                    }
                    });     
                    
                    clearTimeout(timeout);
                    const jsonResponse = await result!.json(); 
                    console.log("result status: " + result!.status);
                    
                    if(result?.status == 429){
                        console.log("Too many calls!");
                        return;
                    }

                    // No subscription data available so direct them to payment page.
                    if(result?.status == 401){
                        if(jsonResponse.Error.includes("No purchase history")){
                            console.log("No purchase history!")
                            Alert.alert("Please subscribe!");
                            navigation.navigate("Payment");
                            return;
                        }
                    }

                    const now = new Date();
                    const expirationDate = new Date(jsonResponse.ExpireDate);
                    console.log("Now: " + now + " Expired: " + expirationDate);
                    const expired = now > expirationDate;
                    
                    if(expired){
                        console.log("Expired"); 
                        storeReceiptData(subInfoPath, expirationDate, false);
                        if(currentScreen != "Payment"){
                            Alert.alert("Please subscribe!");
                            navigation.navigate("Payment");
                        }
                        return expired;
                    }   
                    else{    
                        setValidSubscription(true);
                        console.log("Valid");
                    }
                    
                    storeReceiptData(subInfoPath, expirationDate, true);
                    
                    if((currentScreen == "Payment" || currentScreen == 'Login') && GlobalState.uid.length > 0 && photoLength > 0){
                        navigation.navigate('Data', {imageData: null});
                    }
                    else if((currentScreen == "Payment") || (currentScreen == "Login") && GlobalState.uid.length > 0){
                        navigation.navigate("Home");
                    }
                    else if(currentScreen == "Data" && GlobalState.uid.length > 0){
                         navigation.navigate('Data', {imageData: null});
                    }
                    else if(currentScreen == "Home" && GlobalState.uid.length > 0){
                         navigation.navigate('Home');
                    }

                    return;;
      }


      // Fetches the subscription info from firestore database if it doesn't exist/is expired in local storage
    const fetchFromDatabase = async (subInfoPath: string, page: string, photoLength: number) => {
            try{
                const dbCollection = collection(firestore, "Users");
                const docRef = doc(dbCollection, GlobalState.uid);
                const docSnap = await getDoc(docRef);
                const now = new Date();
                if(docSnap.exists()){
                    console.log("Database portion exists!");
                    const user = docSnap.data() as UserDataTypes;

                    // User has an account but never paid or renewed.
                    if(user!.hasOwnProperty("paid")){
                        if(!user!.paid){
                            Alert.alert("Please subscribe!");
                            navigation.navigate("Payment");
                            return;
                        }
                    }
                    
                    // User has never had a subscription before.
                    if(!user!.hasOwnProperty("expirationDate")){
                        console.log("Doesn't have it!");
                        try{
                            const receiptInfo = await getReceiptIOS({forceRefresh: true});
                            console.log("Receipt from the data: " + receiptInfo);
                            validateReceipt(receiptInfo!, subInfoPath, page, photoLength);
                        }
                        catch (error){
                            console.log("Error: " + error);
                        }  
                        return;
                    } 
                    
                    const subDate = new Date(user!.expirationDate.toDate())
                    console.log("Database expiration date: " + subDate + " Now: " + now);
                    if(subDate > now){
                        console.log("Valid database expiration date!");
                        const newSubInfo = {paid: true, expirationDate: subDate};
                        setValidSubscription(true);
                        const exists = await RNFS.exists(userDir);
                        if(!exists){
                            await RNFS.mkdir(userDir);
                        }
                        
                        await RNFS.writeFile(subInfoPath, JSON.stringify(newSubInfo), 'utf8')
                    
                        if(page == "Home" && GlobalState.uid.length > 0){
                            navigation.navigate("Home");
                        }
                        else if(page == "Data" && GlobalState.uid.length > 0){
                            navigation.navigate('Data', {imageData: null});
                        }
                        else if(page == "Login" && photoLength > 0 && GlobalState.uid.length > 0){
                            navigation.navigate('Data', {imageData: null});
                        }
                        else if(page == "Login" && GlobalState.uid.length > 0){
                            navigation.navigate("Home");
                        }
                    }
                    else{ 
                        try{
                            const receiptInfo = await getReceiptIOS({forceRefresh: true});
                            console.log("Receipt from the data: " + receiptInfo);
                            validateReceipt(receiptInfo!, subInfoPath, page, photoLength);
                        }
                        catch (error){
                            console.log("Error: " + error);
                        }  
                    }
                }
             
            }
            catch(error){
                console.log("Error with database: " + error);
            }
        }

    const checkLocal = async (subInfoPath: string, photoLength: number): Promise<boolean> => {
         try{
                        const exists = await RNFS.exists(subInfoPath);
        
                        if(!exists){
                            console.log("Doesn't exist!")
                            fetchFromDatabase(subInfoPath, currentScreen, photoLength);
                            return false;
                        }

                        const subscriptionStringInfo = await RNFS.readFile(subInfoPath);
                        const subscriptionInfo = JSON.parse(subscriptionStringInfo);
                        console.log("This is the parsed data: " + subscriptionStringInfo);
                        
                        if(subscriptionInfo.paid){
                            const now = new Date();
                            const subDate = new Date(subscriptionInfo.expirationDate)
                            console.log("Local expiration date: " + subDate + " Now:" + now);
                            if(subDate > now){
                                setValidSubscription(true);
                                
                                console.log("Valid local expiration date!");
                                if(currentScreen == 'Login' && photoLength > 0){
                                    navigation.navigate('Data', {imageData: null});
                                }
                                else if(currentScreen == 'Login'){
                                    navigation.navigate('Home');
                                }

                                return true;
                            }
                            else{
                                fetchFromDatabase(subInfoPath, currentScreen, photoLength);
                            }
                        }
                        else{
                            // fetchFromDatabase(subInfoPath, "Home");
                            Alert.alert("Please subscribe!");
                            navigation.navigate("Payment");
                            return false;
                        }
                    }
                    catch(error){
                        console.log("Error: " + error);
                    }

                    return false;
             }

        return {
            checkLocal: checkLocal,
            validate: validateReceipt
        }
    }