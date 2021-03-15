import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'; 
import db from '../config.js';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage : ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    initiateBookIssue = async ()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Issue"
      })
  
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability' : false
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
      })
  
      this.setState({
        scannedStudentId : '',
        scannedBookId: ''
      })
    }
    initiateBookReturn = async ()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Return"
      })
  
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability' : true
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
      })
  
      this.setState({
        scannedStudentId : '',
        scannedBookId: ''
      })
    }
    checkBookEligibilty= async() =>{
      console.log("Book id"+this.state.scannedBookId);
    const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
    console.log("BookRef"+bookRef);
    console.log("Length"+bookRef.docs.length);
    var transactionType="";
    if(bookRef.docs.length===0){
      transactionType=false;
    }else{

      bookRef.docs.map(doc=>{
        var book= doc.data();
        if(book.bookAvailabilty){
          transactionType="Issue";
        }
        else{
          transactionType="Return"
        }
      })

    }
    return transactionType;
    }

    checkStudentEligibiltyForIssue = async()=>{
      const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
      var isStudentEligible="";
      if(studentRef.docs.length===0){
        isStudentEligible=false;
        this.setState({scannedBookId:"",scannedStudentId:""});
        alert('This student Id does not exist in the database');
      }else{
  
        studentRef.docs.map(doc=>{
          var student= doc.data();
          if(student.numberOfBooksIssued<4){
            isStudentEligible=true;
          }
          else{
            isStudentEligible=false;
            alert('No. of books issue limit has been passed');
            this.setState({scannedBookId:"",scannedStudentId:""})
          }
        })
  
      }
      return isStudentEligible;


    }

    checkStudentEligibiltyForReturn = async()=>{
      const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
      var isStudentEligible="";

        transactionRef.docs.map(doc=>{
          var lastTransaction= doc.data();
          if(lastTransaction.studentId===this.state.scannedStudentId){
            isStudentEligible=true;
          }
          else{
            isStudentEligible=false;
            alert('The book was not issued by the same student');
            this.setState({scannedBookId:"",scannedStudentId:""})
          }
        })
  
      return isStudentEligible;


    }
  
    //handeling the transactions
    handleTransaction = async()=>{
     //var transactionType= await this.checkBookEligibilty();
     var transactionType="Return";

     if(transactionType===false){
       alert("The book doesn't exist in the database");
       this.setState({
         scannedBookId:'',
         scannedStudentId:''
       })
     }else if(transactionType==='Issue'){
var isStudentEligible=await this.checkStudentEligibiltyForIssue();

if(isStudentEligible===true){

  this.initiateBookIssue();
alert("Book issued to student");
}}else{
  var isStudentEligible=await this.checkStudentEligibiltyForReturn();

  if(isStudentEligible===true){
  
    this.initiateBookReturn();
  alert("Book returned to library");
  }

}

     
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          
          <KeyboardAvoidingView style={styles.container} 
          behavior='padding' enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.submitButton} 
              onPress={async()=>{this.handleTransaction()}}>
                <Text style={styles.submitButtonText}>SUBMIT</Text>
              </TouchableOpacity>
            
            </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      justifyContent: 'center',

      borderWidth: 2,
      borderRadius: 15,
      width: 100,
      height: 40,
    },
    submitButton:{
backgroundColor:'#66BB6A',
justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 15,
    marginTop: 50,
    width: 200,
    height: 50,

    },
    submitButtonText:{
      padding:10,
      textAlign: 'center',
      fontSize:20
    }
  });