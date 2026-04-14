import { useState,useEffect } from "react";
import "./App.css";
import { FiEdit, FiTrash } from "react-icons/fi";
import { IoIosAddCircle } from "react-icons/io";
import Signin from "./signin";
import Signup from "./signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";



export default function App() {
  return (<BrowserRouter>
  <Toaster position="top-right" reverseOrder={false} />
  <Routes>

    <Route path="/" element={<Todos/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/signin" element={<Signin/>}/>


  </Routes>
  </BrowserRouter>);
}

function Todos() {

 const navigate=useNavigate() ;

  const[value,setValue]=useState("");
  const [todos, setTodos] = useState([]);
  const[editIndex,setEditIndex]=useState(null) ;
  const[editText,setEditText]=useState("") ;
  const [loading, setLoading] = useState(true);

    useEffect(()=>{
  
          const token = localStorage.getItem("token");
          if (!token)
          {
              navigate("/signin") ;
              return ;
          }
  
  
          async function verifyToken(){
             
              try{
                       const res=await fetch("http://localhost:3000/verify",{
                       method:"GET",
                       headers:{
                               token:localStorage.getItem("token") 
                              }
                          })
  
                      if (!res.ok) {
                          localStorage.removeItem("token");
                          navigate("/signin") ;
                          return;
                      }
  
                          const data=await res.json() ;
  
                          if(data.authenticated)
                          {   
                              
                             const res1=await fetch("http://localhost:3000/todos",{
                              method:"GET",
                              headers:{
                                token:localStorage.getItem("token")
                              }
                             })

                              if(res1.ok)
                              {
                                  const resTodos=await res1.json() ;
                                  console.log(resTodos.todos) ;
                                  setTodos(resTodos.todos) ;
                              }


                              setLoading(false) ;
                          }
  
                          console.log(data) ;
              }
              catch(e){
                  console.log(e) ;
              }
  
  
          }
  
          verifyToken() ;
      },[])

      async function fetchTodo(){
              const res1=await fetch("http://localhost:3000/todos",{
                              method:"GET",
                              headers:{
                                token:localStorage.getItem("token")
                              }
                             })

                              if(res1.ok)
                              {
                                  const resTodos=await res1.json() ;
                                  console.log(resTodos.todos) ;
                                  setTodos(resTodos.todos) ;
                              }
      }


      if(loading)
      {
          return <div className="LoadingDiv"><h2 style={{color: "white"}}>Loading...</h2></div>
      }

  
  function handleChange(e){
    if(e.target.value!=" "){
    setValue(e.target.value) ;
   
    }
  }

  async function addTodo(){
      if(value.trim() === "") return;  

   

                    await  fetch("http://localhost:3000/todo", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      token: localStorage.getItem("token")
                  },
                  body: JSON.stringify({
                      title: value
                  })
              })

   

      await fetchTodo() ;
      
   
  }

 async function todoToggle(index){
    await fetch(`http://localhost:3000/todo/${todos[index]._id}`,{
    method:"PUT",
    headers:{
       "Content-Type": "application/json",
      token:localStorage.getItem("token")
    },
    body:JSON.stringify({
       title:todos[index].title,
       done:!todos[index].done
    })
  })
    
      await fetchTodo() ;
  }

  
async function todoDelete(id){

      await fetch(`http://localhost:3000/todos/${id}`,{
        method:"DELETE",
        headers:{
          token:localStorage.getItem("token")
        }
      })

  await fetchTodo() ;
 
}

function todoEdit(index){
     setEditIndex(index) ;
     setEditText(todos[index].title) ;
}

async function saveEdit(index){
    if(editText.trim() === ""){
    setEditIndex(null);
    return;
  }

  await fetch(`http://localhost:3000/todo/${todos[index]._id}`,{
    method:"PUT",
    headers:{
       "Content-Type": "application/json",
      token:localStorage.getItem("token")
    },
    body:JSON.stringify({
       title:editText ,
       done:todos[index].done
    })
  })

  await fetchTodo() ;
  setEditIndex(null);
  setEditText("");
}


  return (
    <div className="parentDiv">
      <div className="header">
        <div>
          <h1 className="todoText">Todo Done</h1>
          <h2 className="todoText">keep it UP</h2>
        </div>

        <div className="circle"> {todos.filter(todo => todo.done).length}/{todos.length}</div>
      </div>

      
      <div className="searchSection">
        <input className="inputBox" placeholder="Write your next task"  onChange={handleChange} value={value} ></input>
        <div className="addTodoSign" onClick={addTodo}><IoIosAddCircle/></div>
      </div>
      
     
      <div> 
            {todos.map((todo,index) => (
              <div key={todo._id} className="todoDiv">

                <div className="container">
                  <input className="checkbox" type="checkbox" checked={todo.done} onChange={()=>todoToggle(index)}></input>
                </div>


                  {editIndex===index ? (

                              <input
                              className="editInput"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if(e.key === "Enter"){
                                  saveEdit(index);
                                }

                                if (e.key === "Escape") setEditIndex(null);
                              }}
                               onBlur={() => saveEdit(index)}
                              autoFocus
                            />


                  ):(
                     <h3 className="todoText"  style={{textDecoration: todo.done ? "line-through" : "none"}}>{todo.title}</h3>
                  )}
                      

                
               
                <div className="taskIcons">
                  <FiEdit className="editIcon" onClick={()=>todoEdit(index)} />
                  <FiTrash className="deleteIcon" onClick={()=>todoDelete(todo._id)}/>
                </div>

              </div>
            ))}

      </div>


    </div>
  );
}