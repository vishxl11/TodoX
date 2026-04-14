import { useState,useEffect } from "react"
import "./Signin.css"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signin(){

  useEffect(()=>{

        const token = localStorage.getItem("token");
        if (!token) return;


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
                        return;
                    }

                        const data=await res.json() ;

                        if(data.authenticated)
                        {
                            navigate("/") ;
                        }

                        console.log(data) ;
            }
            catch(e){
                console.log(e) ;
            }


        }

        verifyToken() ;
    },[])

    const navigate=useNavigate() ;

    const [formData,setFormData]=useState({
        email:"",
        password:""
    }) ;

    function handleChange(e){
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        }) ;
    }

    async function handleSignin(e){
        e.preventDefault() ;

        try{

            const res=await fetch("http://localhost:3000/signin",{
                method:"POST",
                headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
            }) ;

            const data=await res.json() ;

            if(res.ok)
            {
                toast.success("signed in successfully") ;
                localStorage.setItem("token",data.token) ;
                navigate("/") ;
                console.log(data) ;
            }
            else
            {
                toast.error(data.message) ;
            }

        }
        catch(err){
            toast.error("sometihng went wrong nigga") ;

        }
    }

    return(<div className="parentDiv">
        <form className="form" onSubmit={handleSignin}>
            <h2 className="signinheader">Sign in</h2>
            <label style={{color:"white"}} className="emailLabel">
               Email: <input type="email" placeholder="Email" name="email" onChange={handleChange} value={formData.email} className="emailInput"/>
            </label>
            
            
            <label style={{color:"white"}} className="passwordLabel">
               Password: <input type="password" placeholder="Password" name="password" onChange={handleChange} value={formData.password} className="passwordInput"/>
            </label>
          

            <button>Submit</button>
        </form>
        <p className="authRedirectText">
            Don’t have an account?{" "}
            <span className="authRedirectLink" onClick={() => navigate("/signup")}>
                Sign Up
            </span>
            </p>
    </div>)

}