const cookieParser = require("cookie-parser");
const  express  = require("express");
const cors=require("cors")
const app=express()
const jwt=require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()


const port=process.env.port || 5000

// all middle wares.
app.use(cors({
  origin:["http://localhost:5174","http://localhost:5173","https://gable-job-portal.web.app"],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())


 



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.qe6izo7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
// test on home route.
    app.get("/",(req,res)=>{
        res.send(`server is runnning on port:${port}`)
    })

    // jwt token generator.


    app.post("/jwt_token",async(req,res)=>{
      const email=req.query.email
      
      const token=jwt.sign({email},process.env.JWT_TOKEN,{expiresIn:"1h"})
      res.cookie("token",token,{httpOnly:true,secure:false})
      
      res.send({success:true})
     
    })

// jwt token verification.

const verify=(req,res,next)=>{
  const token=req.cookies.token
  if(!token){
    res.send([])
    return
  }
else if(token){
  jwt.verify(token,process.env.JWT_TOKEN,(err,decode)=>{
    req.tokenEmail=decode.email
    next()
  })
}
 

}
  
    // all crud operations is starting form here.


    const dataBase=client.db("Gable_career_hub").collection("All_job_post")

    // get all jobs.
app.get("/Get_All_Jobs",async(req,res)=>{
  const result=await dataBase.find()
  const data=await result.toArray()
  res.send(data)
})

app.post("/post_a_job",async(req,res)=>{
  const data=req.body
  const result=await dataBase.insertOne(data)
  res.send(result)
})

// get all data for my jobs page.
app.get("/Get_my_jobs",verify,async(req,res)=>{
  const email=req.query.email
  const verifyEmail=req.tokenEmail
  if(email===verifyEmail){
    const query={adminEmail:email}
  const result=await dataBase.find(query)
  res.send(await result.toArray())
  }
})
// delete a job form my jobs.

app.delete("/Delete_my_jobs",async(req,res)=>{
  const id=req.query.id
  const objId=new ObjectId(id)
  const query={_id:objId}
  const result=await dataBase.deleteOne(query)
  res.send(result)

})
// delet a job item.

app.patch("/Update_my_jobs" ,async(req,res)=>{
  const data=req.body
  const {url,company,title,userName,catagory,salaryRange,jobDetails,jobPost,applicant,Deadline}=data
  const id=new ObjectId(data.id)
  const query={_id:id}
  const newValue={
    $set:{
      url:url,title:title,userName:userName,catagory:catagory,salaryRange:salaryRange,jobDetails:jobDetails,jobPost:jobPost,applicant:applicant,Deadline:Deadline,company:company

    }
  }
  const result=await dataBase.updateOne(query,newValue)
  res.send(result)

})

// get item by id.
app.get("/updateOne/:id",async(req,res)=>{
  const id=req.params.id
  const newId=new ObjectId(id)
  const query={_id:newId}
  const result= await dataBase.findOne(query)
  res.send(result)
  
})
    
// add to applyed job.

app.post("/add_to_job",async(req,res)=>{
  const data=req.body
  const email=data.email
  const jobDatabase=client.db("Gable_career_hub").collection(email)
  const result=await jobDatabase.insertOne(data)
  res.send(result)
})
 
// get applyed job.
app.get("/get_to_job",verify,async(req,res)=>{
  const email=req.query.email
  const TokenEmail=req.tokenEmail
  if(email===TokenEmail){

    const jobDatabase=client.db("Gable_career_hub").collection(email)
    const result=await jobDatabase.find()
    res.send(await result.toArray())
  }


  
})



// updae a field after apply.


app.patch("/update_field",async(req,res)=>{
  const id=req.query.id
  const query={_id:new ObjectId(id)}
  const result= await dataBase.updateOne(query,{$inc:{applicant:1}})
  res.send(result)
})




  

    // end.
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log({runningOn:`http://localhost:${port}`})
  
})


 
// Lj70ouuDVUj726Am
// Gable



