import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { GlobalState } from './GlobalState';
import {collection, doc, getDoc, Timestamp} from '@react-native-firebase/firestore'
import { auth, firestore } from './Firebase.ts';
import {getUniqueId} from 'react-native-device-info';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TextInput as RNTextInput,
    useColorScheme,
    View,
    Button,
    FlatList,
    SectionList,
    Image,
    ImageBackground,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    InteractionManager,
    Animated,
    DevSettings,
    ImageResolvedAssetSource, 
    Alert,
    ActivityIndicator
  
  } from 'react-native';
import { useState, useEffect, useRef, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { UserData } from './UserData.tsx';

  
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#359EA0',
        alignItems: 'center'
        },
        titleText1: {
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            // textShadowColor: "#00ffff",
            // textShadowRadius: 3,
            // textShadowOffset: {width: 0, height: 0},
            position: 'absolute',
            left: '14%',
            top: '20%'
        },
        titleText2: {
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            // textShadowColor: "#00ffff",
            // textShadowRadius: 3,
            // textShadowOffset: {width: 0, height: 0},
            position: 'absolute',
            left: '37%',
            top: '25%'
        },
    input:{
      width: 70, 
      height: 30, 
      position: 'absolute', 
      left: '42%', 
      top: '35%', 
      backgroundColor: 'white', 
      borderRadius: 15, 
      fontSize: 20,
      color: 'black',
      // borderWidth: 1,
      // borderColor: '#00ffff',
      textAlign: 'center',
      alignItems: 'center', 
      justifyContent: 'center'
    },
    navigationContainer:{
        position: 'absolute',
        right: '12%',
        bottom: '8%'
    },
    navigationText:{
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            // textShadowColor: "#00ffff",
            // textShadowRadius: 3,
            // textShadowOffset: {width: 0, height: 0},
    }, 
    okButton1:{
        opacity: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        marginLeft: 5,
        borderRadius: 20,
        // borderWidth: 1,
        // borderColor: '#00ffff',
        width: 40,
        height: 30,
        position: 'absolute',
        left: '60%', 
        top: '35%', 
      },
    okButton2:{
        opacity: 0,
      },
     
      okButtonText:{
        color: 'black',
        fontSize: 15
      }
    }
  )

  type routeProps = NativeStackScreenProps<RootStackParamList, 'Onboard2'>;
  // type customProps = {
  //   setCompletedOnboard: React.Dispatch<React.SetStateAction<boolean | null>>;
  // }

  // type Props = routeProps & customProps;

  export const Onboard2 = ({navigation}: routeProps): React.JSX.Element=> {

    const [keyboardShow, setKeyboardShow] = useState(false);
    const [weight, setWeight] = useState('');
    const {goalWeight, setGoalWeight} = useContext(UserData)
    const {completedOnboard, setCompletedOnboard} = useContext(UserData);
    const inputRef = useRef<RNTextInput>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        const keyBoardShowListener = Keyboard.addListener(
          'keyboardWillShow', () => setKeyboardShow(true)
        )
        const keyBoardHideListener = Keyboard.addListener(
          'keyboardWillHide', () => setKeyboardShow(false)
        )
  
        // Removing to prevent bugs with the event listener
        return () => {
          keyBoardShowListener.remove();
          keyBoardHideListener.remove();
        }
      }, [keyboardShow])

      const removeKeyboard = () =>{
        InteractionManager.runAfterInteractions(() => {
          Keyboard.dismiss(); 
          setKeyboardShow(false);
        })
      }
      

    const storeData = async () => {
        if(weight.length !== 0){
        try{
            const dbCollection = collection(firestore, 'Users');
            await doc(dbCollection, GlobalState.uid).update({goalWeight: weight});
            await doc(dbCollection, GlobalState.uid).update({completedOnboard: true}); 
            setGoalWeight(weight);
            // await doc(dbCollection, GlobalState.uid).update({[deviceName]: RNFS.DocumentDirectoryPath.split('/')[6]})
            setCompletedOnboard(true);
            navigation.navigate('Payment')
            console.log("Successfully stored reasons");
        }
        catch(error){
            console.log("Error: " + error);
        }
      }
      else{
        Alert.alert("Please enter your desired weight!");
      }
    }
    
    return(
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <Text style={styles.titleText1}>What is your desired</Text>
                <Text style={styles.titleText2}>weight?</Text>
                <TextInput keyboardType='numeric' ref={inputRef} style={styles.input} placeholder='lbs' 
                placeholderTextColor={'grey'} onChangeText={text => setWeight(text)} maxLength={5}/>
                <TouchableOpacity style={styles.navigationContainer} onPress={storeData}>
                <Text style={styles.navigationText} >→</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeKeyboard} 
                style={keyboardShow ? styles.okButton1 : styles.okButton2}>  
                                <Text style={styles.okButtonText}>Ok</Text>
                    </TouchableOpacity> 
            </View>
        </TouchableWithoutFeedback>
    )
  }