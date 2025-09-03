import React, {useState, useEffect, useRef, useLayoutEffect, useContext, use} from 'react';

import {
    initConnection,
  PurchaseError,
  useIAP,
  validateReceiptIos,
  getReceiptIOS,
  type Purchase,
  purchaseUpdatedListener,
  getAvailablePurchases
} from "react-native-iap";
import * as RNFS from '@dr.pogodin/react-native-fs';
import {useCheckSubscriptionInfo} from './subscriptionCheck'
    import {
        StyleSheet,
        Text,
        View, 
        TouchableOpacity,
        Alert,
        
        Platform, 
      } from 'react-native';

import { NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { GlobalState } from './GlobalState';
import { UserData } from './UserData';
import {isTablet} from 'react-native-device-info';


const styles = StyleSheet.create({
  subscriptionCard:{
    height: !isTablet() ? 580 : 650, 
    width: !isTablet() ? 300 : 420, 
    borderWidth: 1, 
    margin: 30,
    borderRadius: 15,
    // borderColor: '#00ffff',
    //  shadowRadius: 8,
    //  shadowOpacity: 1,
    //  shadowColor: '#00ffff',
    backgroundColor: 'white',
    padding: 20,
    shadowOffset: {width: 0, height: 0},
    
  },
  text:{
    fontSize: !isTablet() ? 20 : 25, 
    color: 'black'
  },
  largeText:{
            fontSize: !isTablet() ? 24 : 30,  
            fontWeight: 700,
            color: "black",
            alignSelf: 'center',
            marginBottom: 20, 
            marginTop: 10
           },
          
  bullet:{
      fontSize: !isTablet() ? 35 : 40, 
      color: 'black',
  },
  subscribeButton: {
      width: 250,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50, 
        backgroundColor: '#00ffff',
        // marginBottom: 60,
        position: 'absolute',
        bottom: 80,
        left: !isTablet () ? 25 : 75
  },
  restorePurchaseButton: {
      width: 250,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50, 
        backgroundColor: '#00ffff',
        position: 'absolute',
        bottom: 10,
        left: !isTablet () ? 25 : 75
  }
})

type Prop = NativeStackScreenProps<RootStackParamList, "Payment">

export const Payment = ({navigation}: Prop) => {
 
    const userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;
    const subInfoPath = `${userDir}/subInfo`;
    const isIos = Platform.OS === 'ios';
    const {validate} = useCheckSubscriptionInfo()
    // Connects to the product id from AppStoreConnect for the subscription group!
    const subscriptionSkus = Platform.select({ios: ['wj.test1']}); 
    const {imageData} = useContext(UserData);

    const {
    connected,
    subscriptions, //returns subscriptions for this app.
    getSubscriptions, //Gets available subsctiptions for this app.
    currentPurchase, //current purchase for the tranasction
    finishTransaction,
    purchaseHistory, //return the purchase history of the user on the device (sandbox user in dev)
    getPurchaseHistory, //gets users purchase history
    restorePurchases,
    requestSubscription,
    currentPurchaseError
  } = useIAP(); 

  const [triedToSubscribe, setTriedToSubscribe] = useState<boolean | null>(null);    


    
  useEffect(() => { 

      // Gets all of the subscriptions for the app!
  const handleGetSubscriptions = async () => {
    if(!connected) return;
    // await initConnection()
    console.log("Subscriptions: " + subscriptionSkus)   
    try{ 
        
        const res = await getSubscriptions({skus: subscriptionSkus as string[]});

        console.log("result: " + res);
        console.log("Made it here for subscriptions"); 
        console.log("Subscription length: " + subscriptions.length);
    }
    catch (error){
        console.log("Error With Subscription: " + error);  
    } 
  } 
    
    handleGetSubscriptions();
  }, [connected]);


  useEffect(() => {
    if(!connected) return;
    // Gets the purchase history of the user.
  const handleGetPurchaseHistory = async () => {
    try{
        await getPurchaseHistory(); 
    }
    catch (error){
        console.log("Error: " + error);
    }  
  } 

  handleGetPurchaseHistory();  

  }, [connected])

  


  // Navigate to the home screen if the user already purchased a subscription
  useEffect(() => {
   const validate = async () => {
    try{
        // console.log("This is the purchase history: " +  JSON.stringify(purchaseHistory));
        // Searching through the purchase history
        // if(purchaseHistory.find((item) => item.productId === (subscriptionSkus![0]))){
        //     // navigation.navigate("Home");
        // }       
        // else{
        //   setLoading(false);
        // }
 
        //  const receiptInfo = await getReceiptIOS({forceRefresh: true});
        //                             console.log("Receipt from the data: " + receiptInfo);
        // validateReceipt(receiptInfo!);

        // console.log("Purchase History: " + purchaseHistory)
    }
    catch (error){
        console.log("Error: " + error);
    }
    }

    validate();
  }, [connected, purchaseHistory, subscriptions]);

 
  const handleBuySubscription = async (productId: string) => {
    try {
        console.log("Request subscription entered!");
        await requestSubscription({sku: productId});
        setTriedToSubscribe(true);
        // setLoading(false);
    }
    catch (error){
        // setLoading(false);
        console.log("Error: " + error);
    }
  }

  // Restores the users purchase if they have already purchased a subscription.
  const handleRestorePurchase = async () => {
    try{
         await restorePurchases();
         const receiptInfo = await getReceiptIOS({forceRefresh: true});
         if(receiptInfo){
            validate(receiptInfo, subInfoPath, "Home", imageData?.length ?? 0);
         }
    }
    catch(error){
        console.log("Error with restoring purchase: " + error);
        Alert.alert("Couldn't restore purchase at this time. Please try again!");
    }
  }
   

  // Main function called after the subscription is purchased.
  useEffect(() => { 

    const checkPurchase = async (purchase: Purchase | undefined) => {

     console.log("Purchase: " + purchase);
        if(purchase){          
            try{    
                const receipt = purchase.transactionReceipt;
                if(receipt){
                    if(isIos){
                        const isTestEnv = __DEV__;  
                        console.log("This is the currentPurchase error: " + purchaseUpdatedListener)
                        await validate(receipt, subInfoPath, "Home", imageData?.length ?? 0);

                        return; 
                    }  
                } 
            }
            catch (error){
                // setLoading(false);    
                console.log("Error: " + error);
            }
        }
        else{
            console.log("This is the currentPurchase error: " + currentPurchaseError)
            console.log("purchase history error: " + JSON.stringify(purchaseHistory, null, 2)); 

        }
    }  

        console.log("Tried to subscribe: " + triedToSubscribe);
        if(triedToSubscribe){
            checkPurchase(currentPurchase);
        }
  }, [currentPurchase, finishTransaction, triedToSubscribe]);  
  

    return(
        <View style={{flex:1, backgroundColor: '#359EA0', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            

            <View style={styles.subscriptionCard}>
              <Text style={styles.largeText}>Full Access Plan</Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Track daily photos</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Organized journal entries</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Chart display of progress</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Search filtering capability</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Secure login authentication</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Secure storage/backup</Text>
                </Text>
                <Text style={styles.bullet}>{'\u2022'}
                    <Text style={styles.text}>Access on any iOS device</Text>
                </Text>
                
               <Text style={{fontSize: !isTablet() ? 20 : 25, color: 'black', marginTop: 30, alignSelf: 'center'}}>$4.99/month</Text>
                {subscriptions.length > 0 ? <TouchableOpacity onPress={() => handleBuySubscription(subscriptions[0].productId)} style={ styles.subscribeButton}>
                {/* <Text>{subscriptions[0].title} - {subscriptions[0].description}</Text> */}
                <Text style={{color: 'white', fontSize:  !isTablet() ? 20 : 25, fontWeight: 700}}>Subscribe</Text>
            </TouchableOpacity> : 
            //      <TouchableOpacity onPress={() => handleBuySubscription(fakeSubscriptions[0].productId)} style={ styles.subscribeButton}>
            //     {/* <Text>{subscriptions[0].title} - {subscriptions[0].description}</Text> */}
            //     <Text style={{color: 'white', fontSize: 20, fontWeight: 700}}>Subscribe</Text>
            // </TouchableOpacity>
            null
            }
                {subscriptions.length > 0 ? <TouchableOpacity onPress={() => handleRestorePurchase()} style={ styles.restorePurchaseButton}>
                <Text style={{color: 'white', fontSize:  !isTablet() ? 20 : 25, fontWeight: 700}}>Restore Purchase</Text>
            </TouchableOpacity> : 
            null
            }
            </View>

   
        </View>
    );
};