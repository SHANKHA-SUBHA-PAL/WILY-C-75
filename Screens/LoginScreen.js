import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import firebase from 'firebase'


export default class LoginScreen extends React.Component {
    
constructor(){

super()
this.state={

emailId:'',
passWord:''


}

}

logIn= async(email,password)=>{

if(email && password){
    try{
        const response= await firebase.auth().signInWithEmailAndPassword(email,password);
        if(response){
            this.props.navigation.navigate('Transaction');
        }
    }
    catch(error){
        switch(error.code){
            case 'auth/user-not-found':
                alert("User does not exist");
                break;
            case 'auth/invalid-email':
                alert("Invalid email/password");
                break;

        }
    }
}
else{
    alert("Enter email Id and password");
}

}



render(){
return(

<KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}>  
        <View>
            <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>    
        </View>
        <View>
         <TextInput style={styles.loginBox} 
         placeholder="abc@example.com"
         keyboardType='email-address'
         onChangeText={text=>this.setState({emailId:text})}
         />
         <TextInput style={styles.loginBox} 
         placeholder="password"
        secureTextEntry={true}
         onChangeText={text=>this.setState({passWord:text})}
         />
        </View>
        <View>

        <TouchableOpacity style={styles.loginButton}
        onPress={()=>{this.logIn(this.state.emailId,this.state.passWord)}}
        
        >
<Text style={{textAlign:'center'}}>Login</Text>
        </TouchableOpacity>

        </View>
</KeyboardAvoidingView>

)
    

   
}
}

const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    },
    loginButton:{

        height:30,
        width:90,
        borderWidth:1,
        marginTop:20,
        paddingTop:5,
        boderRadius:7,
backgroundColor:'#34ab23'

    }
})

