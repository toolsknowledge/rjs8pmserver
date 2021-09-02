//import the modules
//require() function used to import the modules
const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//create the rest object
const app = express();
//where "app" object is the rest object
//where "app" object, used to develop the rest services
//Ex. GET,POST,PUT,DELETE,PATCH,..........


//set the json as MIME Type
app.use(express.json());


//enable the cors policy
app.use(cors());



//create the reference variable to connect to mongodb database
const miniproject = mongodb.MongoClient;
//where "miniproject" is the reference variable
//where "miniproject" used to connect to database


const obj = require("./token");

//create the post request
app.post("/login",(req,res)=>{
    miniproject.connect(process.env.CONNECTION_URL,(err,connection)=>{
            if(err) throw err;
            else{
                const db = connection.db(process.env.DATABASE_NAME);
                db.collection(process.env.COLLECTION_NAME)
                .find({"email":req.body.email,"password":req.body.password})
                .toArray((err,array)=>{
                    if(err) throw err;
                    else{
                        let label = process.env.RESPONSE_LABEL;
                        let success = process.env.SUCCESS_RESPONSE;
                        let failure = process.env.FAILURE_RESPONSE;
                        if(array.length>0){
                            //generate the token
                            obj.token = jsonwebtoken.sign(
                                 {"email":req.body.email,"password":req.body.password},
                                 process.env.SECRETE_KEY,
                                 {expiresIn:'30d'}
                            );
                            res.status(200).send({ [label]:success, "token":obj.token });
                        }else{
                            res.send({ [label]: failure });
                        }
                    }
                })
            }
    });
});


//middleware
const checkTokens = (req,res,next)=>{
    let allHeaders = req.headers;
    if(allHeaders.token === obj.token){
        next();
    }else{
        res.send({"msg":"authentication failed"});
    }
};



app.get("/category/:item",[checkTokens],(req,res)=>{
        //item => Washing_Machine / acs / cameras
        
        miniproject.connect(process.env.CONNECTION_URL,(err,connection)=>{
            if(err) throw err;
            else{
                const db = connection.db(process.env.DATABASE_NAME);
                db.collection(req.params.item).find().toArray((err,array)=>{
                    if(err) throw err;
                    else{
                        res.send(array);
                    }
                })
            }
        });

});




let port = process.env.PORT || 1234;

app.listen(port,()=>{
    console.log("server listening the port number 8080");
});















