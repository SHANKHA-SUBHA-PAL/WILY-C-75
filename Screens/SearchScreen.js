import React from 'react';
import { Text, View,ScrollView,FlatList ,StyleSheet,TextInput,TouchableOpacity} from 'react-native';
import firebase from 'firebase';
import db from '../config';

export default class Searchscreen extends React.Component {
  constructor(){
    super()
    this.state={

    allTransactions: [],
    lastVisibleTransaction: null,
    search:''

  }

  }
  componentDidMount = async ()=>{

    const query= await db.collection("transactions").limit(10).get();
    query.docs.map(doc=>{
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc

      })
    })
    
  }

  fetchMoreTransactions= async()=>{
    var text= this.state.search;
    var enteredText= text.split("");
    
    if(enteredText[0].toUpperCase()==='B'){
      const transaction= await db.collection("transactions").where("bookId","==",text).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==='S'){
      const transaction= await db.collection("transactions").where("studentId","==",text).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  searchTransactions=async(text)=>{
    console.log(text);
    var enteredText= text.split("");
    
    if(enteredText[0].toUpperCase()==='B'){
      const transaction= await db.collection("transactions").where("bookId","==",text.toUpperCase()).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==='S'){
      const transaction= await db.collection("transactions").where("studentId","==",text.toUpperCase()).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
   
}

    render() {
      return (
        <View style={styles.container}>
          <View style={styles.searchBar}>
              <TextInput
              style={styles.bar}
              placeholder="Enter Book id or Student Id"
              onChangeText={text=>{
                this.setState({search:text})

              }}
              />
              <TouchableOpacity style={styles.searchButton}
              onPress={()=>{
                this.setState({
                  allTransactions:[]
                })
                this.searchTransactions(this.state.search)
              }}>
                <Text>Search</Text>
              </TouchableOpacity>
          </View>
        <FlatList
        data={this.state.allTransactions}
        renderItem={({item})=>{
          return(
            <View>
              <Text>{"Book Id : "+item.bookId}</Text>
              <Text>{"Student Id : "+item.studentId}</Text>
              <Text>{"Transaction Type :"+item.transactionType}</Text>
              <Text>{"Date : "+item.date.toDate() }</Text>
            </View>
          )
        }}
        keyExtractor={(item,index)=>index.toString()}
        onEndReachedThreshold={0.7}
        onEndReached={this.fetchMoreTransactions}/>
        </View>
      );
      
    }
  }


  const styles=StyleSheet.create({
    container: {
        flex:1,
        marginTop:20
    },
    searchBar: {
        flexDirection:"row",
        height:40,
        width:"auto",
        borderWidth:0.5,
        alignItems:"center",
        backgroundColor:"grey",
        marginTop:50
    },
    bar: {
        borderWidth:2,
        height:30,
        width:300,
        paddingLeft:10
    },
    searchButton:{
        borderWidth:1,
        height:30,
        width:50,
        alignItems:"center",
        justifyContent:"center",
        backgroundColor:"green"
    }
})