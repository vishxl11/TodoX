const mongoose=require("mongoose") ;
const Schema=mongoose.Schema ;
const ObjectId=Schema.Types.ObjectId ;

const users=new Schema({
    email:{type:String,unique:true},
     name: String ,
    password:String 
   
})

const todos=new Schema({
    title:String ,
    done:Boolean,
    userId:{type:ObjectId,ref:'users'}
})

const usersModel=mongoose.model("users",users);
const todosModel=mongoose.model("todos",todos) ;

module.exports={
    usersModel,
    todosModel
}





