import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { GlobalState } from './GlobalState';
import {collection, doc, getDoc, Timestamp} from '@react-native-firebase/firestore'
import { auth, firestore } from './Firebase.ts';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TextInput as RNTextInput,
    useColorScheme,
    View,
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
import { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';

  
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
            left: '10%',
            top: '10%'
        },
        titleText2: {
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            // textShadowColor: "#00ffff",
            // textShadowRadius: 3,
            // textShadowOffset: {width: 0, height: 0},
            position: 'absolute',
            left: '7%',
            top: '15%'
        },
    input:{
      width: 300, 
      height: 400, 
      position: 'absolute', 
      left: '13%', 
      top: '25%', 
      backgroundColor: 'white', 
      borderRadius: 15, 
      paddingTop: 20,
      paddingBottom: 180,
      paddingLeft: 20,
      paddingRight: 20,
      fontSize: 20,
      color: 'black',
      // borderWidth: 1,
      // borderColor: 'black'
    },
    navigationContainer:{
        position: 'absolute',
        right: '12%',
        bottom: '8%'
    },
    doneButton1:{
        position: 'absolute', right: 50, top: '21%', opacity: 1
    },
    doneButton2:{
        position: 'absolute', right: 50, top: '21%', opacity: 0
    },
    text: {
        fontSize: 23,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: '#00ffff',
        textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
        textShadowRadius: 2, // Controls how far the shadow blurs out.
        
      },
    navigationText:{
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            // textShadowColor: "#00ffff",
            // textShadowRadius: 3,
            // textShadowOffset: {width: 0, height: 0},
    }
    }
  )

  type Props = NativeStackScreenProps<RootStackParamList, 'Onboard1'>;

  export const Onboard1 = ({navigation}: Props): React.JSX.Element=> {

    const [reasons, setReasons] = useState('');
    const [keyboardShow, setKeyboardShow] = useState(false);

    const inputRef = useRef<RNTextInput>(null)
    
    

    const storeData = async () => {
      if(reasons.length !== 0){
        try{
            const dbCollection = collection(firestore, 'Users');
            await doc(dbCollection, GlobalState.uid).update({reasons: reasons});
            navigation.navigate('Onboard2')
            console.log("Successfully stored reasons");
        }
        catch(error){
            console.log("Error: " + error);
        }
      }
      else{
        Alert.alert("Please give your reasoning for using this app!");
      }
    }

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


    return(
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <Text style={styles.titleText1}>What are your reasons</Text>
                <Text style={styles.titleText2}>for tracking your weight?</Text>
                <TouchableOpacity style={keyboardShow ? styles.doneButton1 : styles.doneButton2} onPress={() => Keyboard.dismiss()}>
                                    <Text style={styles.text}>Done</Text>
                                  </TouchableOpacity>
                <TextInput ref={inputRef} multiline={true} style={styles.input} placeholder='Reasons...' 
                placeholderTextColor={'grey'} onChangeText={text => setReasons(text)}/>
                <TouchableOpacity style={styles.navigationContainer} onPress={storeData}>
                <Text style={styles.navigationText} >→</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    )
  }