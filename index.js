const cookieParser = require("cookie-parser");
const  express  = require("express");
const cors=require("cors")
const app=express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()


const port=process.env.port || 5000

// all middle wares.
app.use(cors())
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

    app.get("/",(req,res)=>{
        res.send(`server is runnning on port:${port}`)
    })

    // all crud operations is starting form here.

const dataBase=client.db("Gable_career_hub").collection("All_job_post")
app.post("/post_a_job",async(req,res)=>{
  const data=req.body
  const result=await dataBase.insertOne(data)
  res.send(result)
})

// get all data for my jobs page.
app.get("/Get_my_jobs",async(req,res)=>{
  const email=req.query.email
  const query={adminEmail:email}
  const result=await dataBase.find(query)
  res.send(await result.toArray())
})
// delete a job form my jobs.

app.delete("/Delete_my_jobs",async(req,res)=>{
  const id=req.query.id
  const objId=new ObjectId(id)
  const query={_id:objId}
  const result=await dataBase.deleteOne(query)
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




