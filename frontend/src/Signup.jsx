import { useState ,useEffect} from "react"
import "./Signup.css"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup(){
    const navigate = useNavigate();


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

   

    const [formData,setFormData]=useState({
        name:"",
        email:"",
        password:""
    }) ;

    function handleChange(e){
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        }) ;
    }

    async function handleSignup(e){
        e.preventDefault() ;

       try{
         const res=await fetch("http://localhost:3000/signup",{
            method:"POST",
             headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        }) ;

        const data=await res.json() ;

        console.log(data) ;
          if (res.ok) {
            toast.success("User Created Successfully");
            navigate("/signin");
        } else {
            if(res.status==409)
            {
                toast.error("Email already exists");
            }
            else
            {
                toast.error(data.message[0].message);
            }
        }

        console.log(data);

    } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
    }

    } 

    return(<div className="signupparentDiv">
        <form className="signupForm" onSubmit={handleSignup}>
            <h2 className="signupHeader">Sign Up</h2>
             <label className="signupName"style={{color:"white"}}>
               Name: <input type="name" placeholder="name" name="name" onChange={handleChange} value={formData.name} className="signupNameInput"/>
            </label>
           

            <label style={{color:"white"}} className="signupEmail">
               Email: <input type="email" placeholder="Email" name="email" onChange={handleChange} value={formData.email} className="signupEmailInput"/>
            </label>
         
            
            <label style={{color:"white"}} className="signupPassword">
               Password: <input type="password" placeholder="Password" name="password" onChange={handleChange} value={formData.password} className="signupPasswordInput"/>
            </label>
           

            <button className="signupSubmit">Submit</button>
        </form>
             <p className="authRedirectText">
            Already have an account?{" "}
            <span className="authRedirectLink" onClick={() => navigate("/signin")}>
                Sign In
            </span>
            </p>
    </div>)

}