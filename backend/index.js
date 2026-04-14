const express=require('express') ;
const mongoose=require("mongoose") ;
const jwt=require("jsonwebtoken") ;
const bcrypt=require("bcrypt") ;
const {z}=require("zod") ;
const dotenv=require("dotenv");
const cors=require("cors") ;
const { usersModel, todosModel } = require("./db");

dotenv.config()
db_URL=process.env.DB_URL 
JWT_SECRET=process.env.JWT_SECRET

async function main() {
    await mongoose.connect(db_URL);
}

main();

const app=express() ;

app.use(express.json()) ;
app.use(cors()) ;

app.post("/signup",async function(req,res){

    const zodSchema=z.object({
        email:z.email({error:"Invalide email address"}).min(1,{error:"Email is required"}) ,
        name:z.string().min(3,{error:"name is too short"}).max(100,{error:"name is too long"}),
        password:z.string().min(8,{error:"Password must contain at least 8 characters"}).max(32,{error:"Password is too long"})
    }) ;

    const validation=zodSchema.safeParse(req.body) ;

    if(!validation.success)
    {
         res.status(400).json({
            message:validation.error.issues
           
         })
         return 
    }

    const email=req.body.email ;
    const name=req.body.name ;
    const password=req.body.password ;


    try
    {
         const hashedPassword=await bcrypt.hash(password,5) ;

         await usersModel.create({
            email:email ,
            password:hashedPassword,
            name:name 
         })

    }
    catch(e)
    {
        res.status(409).json({
            message:"User already exists"
        })
        return 
    }

    res.json({
        message:"You are logged in "
    })



})

app.post("/signin",async function(req,res){

    const email=req.body.email ;
    const password=req.body.password ;

    const user=await usersModel.findOne({
            email:email,
        }) ;

     if(!user)
     {
         res.status(400).json({
            message:"User does not exists"
         })
         return ;
     }

     const passwordMatch=await bcrypt.compare(password,user.password) ;

     if(passwordMatch)
     {
        const token=jwt.sign({
            id: user._id 
        },JWT_SECRET)

        res.json({
            token:token
        })
     }
     else
     {
         res.status(400).json({
            message:"Invalide Credentials"
         })
     }

}) ;

app.post("/todo",auth,async function(req,res){

    const userId=req.userId ;
    const title=req.body.title ;

    await todosModel.create({
        title:title ,
        done:false ,
        userId:userId 
    }) ;

    res.json(
        {
            message:"done nigga"
        }
    )




})

app.get("/todos",auth,async function(req,res){

    const userId=req.userId  ;

    const todos=await todosModel.find({
        userId:userId 
    })

    res.json({
        todos 
    })

})


app.delete("/todos/:id",auth,async function(req,res){
    const todoId=req.params.id ;
    const userId=req.userId

    console.log(userId) ;

   try{

    const result=await todosModel.deleteOne({
        _id:todoId,
        userId:userId
    })

     console.log(result) ;

     if(result.deletedCount==0)
     {
         res.status(400).json({
            message:"to do Not found"
       })
       return ;
     }

     res.json({
        message:"Todo deleted Sucessfully"
     }) ;
     return ;
   }
   catch(e){

    res.status(400).json({
        message:"Invalid id"
    })

    return ;
   }

   

  
})

app.put("/todo/:id",auth,async function(req,res){
    const userId=req.userId ;
    const id=req.params.id ;

    const {title,done}=req.body ;

    if(title==undefined && done==undefined)
    {
         res.status(400).json({
            message:"No field for update"
         }) ;
         return ;
    }

    const updateField={}

     if(title!=undefined)
    {
         updateField.title=title ;
    }

    if(done!=undefined)
    {
        updateField.done=done ;
    }

    try{

        const result=await todosModel.findOneAndUpdate(
            {
                _id:id,
                userId:userId 
            },
            {
                $set:updateField
            },
            {
                returnDocument:'after'
            }
        )

        if(!result){
            res.status(400).json({
                message:"Todo not found"
            }) ;
            return ;
        }

        res.json({
            message:"Todo Updated sucessfully"
        }) ;
        return 
    }
    catch(e){
        
        res.status(400).json({
            message:"Invalid todo id"
        }) ;
        return ;
    }



})


function auth(req,res,next){

    const token=req.headers.token ;
    const decodedData=jwt.verify(token,JWT_SECRET) ;

   if(decodedData){
      req.userId=decodedData.id ;
      next() ;
   }
   else
   {
       res.status(403).json({
         message:"Incorrect credentials" 
       })
   }
    
}


app.get("/verify", auth, async function (req, res) {
    res.json({
        authenticated: true,
        userId: req.userId
    });
});


app.listen(3000) ;