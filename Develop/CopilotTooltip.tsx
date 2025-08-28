import { CopilotProvider, useCopilot } from "react-native-copilot"
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import { useState } from "react"
// import type { TooltipProps } from "react-native-copilot"

export const TooltipComponent = () => {
    const {
        isFirstStep,
        isLastStep,
        currentStep,
        goToNext,
        goToPrev,
        goToNth,
        stop,
        registerStep
       
    } = useCopilot()

    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            width: 200, 
            height: 120, 
            alignItems: 'center', 
            borderRadius: 20, 
            backgroundColor: 'grey'
        },
        navigationContainer:{
            flexDirection: 'row',
            gap: 50, 
            position: 'absolute',
            bottom: 10, 
            justifyContent: 'center',
            width: '100%',
        },
        welcomeText: {
            fontSize: 18,
            color: 'white',
            fontWeight: 'bold',
            textShadowColor: '#00ffff',
            textShadowOffset: {width: 0, height: 0}, 
            textShadowRadius: 2, 
            alignSelf: 'center'
          },
        text: {
            fontSize: 18,
            color: 'white',
            fontWeight: 'bold',
            textShadowColor: '#00ffff',
            textShadowOffset: {width: 0, height: 0}, 
            textShadowRadius: 2, 
          },
    })

    const [current, setCurrent] = useState(0)

    console.log(currentStep?.name)

    return(
        <View style={styles.container}>
                
               {currentStep?.order=== 1 ? 
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.text}>This is your Main Page</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={stop}>
                    <Text style={styles.text}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 2 ? 
                <View style={{flex: 1, alignItems: 'center'}}>
    
                    <Text style={styles.text}>This is your</Text>
                    <Text style={styles.text}>Capture Button</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 3 ? 
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.text}>This is your</Text>
                    <Text style={styles.text}>Account/Settings</Text>
                    <Text style={styles.text}>Menu</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 4 ? 
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.text}>This button will take</Text>
                    <Text style={styles.text}>you to your Data Page</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 5 ? 
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.text}>This is your</Text>
                    <Text style={styles.text}>Flash Button</Text>
                    
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 6 ? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>Take a selfie with</Text>
                    <Text style={styles.text}>the Capture Button</Text>
                    
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    stop()
                    setCurrent(7);
                }
                    }>
                    <Text style={styles.text}>Done</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
                {currentStep?.order=== 7 ? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>Retake your picture</Text>
                    <Text style={styles.text}>if necessary</Text>
                    
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={stop}> 
                    <Text style={styles.text}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 8? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>Go take your Full Body </Text>
                    <Text style={styles.text}>Shot when satisfied</Text>
                    {/* <Text style={styles.text}>Toggle On/Off</Text> */}
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPrev}>
                    <Text style={styles.text}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => stop()}>
                    <Text style={styles.text}>Done</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 9? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>This is your</Text>
                    <Text style={styles.text}>Flip Camera Button</Text>
                    {/* <Text style={styles.text}>Toggle On/Off</Text> */}
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={() => stop()}>
                    <Text style={styles.text}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToNext()}>
                    <Text style={styles.text}>Next</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 10? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>Take a Full Body Shot</Text>
                    <Text style={styles.text}>with the</Text>
                    <Text style={styles.text}>Capture Button</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={() => stop()}>
                    <Text style={styles.text}>Done</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
               {currentStep?.order=== 11? 
                <View style={{flex: 1, alignItems: 'center'}}> 
                    <Text style={styles.text}>Record in your</Text>
                    <Text style={styles.text}>Daily Journal</Text>
                <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={() => stop()}>
                    <Text style={styles.text}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => stop()}>
                    <Text style={styles.text}>Done</Text>
                </TouchableOpacity>
                </View>
                </View>  
                : null}
            
        </View>
    )
}

export const StepNumberComponent = () => {
    // const {
    //     isFirstStep,
    //     isLastStep,
    //     currentStep,
    //     goToNext,
    //     goToPrev,
    //     stop
       
    // } = useCopilot()

    return(
        // <View style= {{backgroundColor: '#00ffff', borderRadius: 50, alignItems: 'center', justifyContent: 'center',
        //      width: 25, height: 25}}>
        //      <Text style={{color: 'white', fontWeight: 700}}>{currentStep?.order}</Text>
        // </View>
        <View>

        </View>
    )
}