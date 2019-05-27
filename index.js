'use strict'

var express = require('express');
var bodyParser = require('body-parser')
var app = express()
var MongoClient = require('mongodb').MongoClient
var MONGO_ADDR = "mongodb://codyfisher1:TGzUiVSQ6L22Pxr88rAKgpxxM2ff4NRBM7KioTallsegMq0COfB2EiuIA2mpLHeqmLnA1CAKadrzvHSnk9IgCg%3D%3D@codyfisher1.documents.azure.com:10255/?ssl=true"
var http = requrie('http')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mqtt = require('mqtt')
var MQTT_ADDR = "mqtt://192.168.11.2:8888";
var client = mqtt.connect(MQTT_ADDR,{clientId: 'bgtestnodejs', protocolId: 'MQIsdp', protocolVersion: 3, connectTimeout:1000, debug:true})

app.post('/publish', function(req,res){
    var topic = req.body.topic
    var message = req.body.message
    client.publish(topic,message)
    console.log('Topic: '+topic+', Message: '+message)
    res.end("Sent")
})



client.subscribe('#')
client.on('message',function(topic,message){
   var MQTT_Message = {'TagName':'Tag','Topic':topic,'Message':message}
   console.log('Incoming Message; Topic: '+topic+', Message: '+message) 
})

client.on('message',function(topic,message){
    MongoClient.connect(MONGO_ADDR,{ useNewUrlParser: true }, function(err,db){
        var dbo = db.db('DB')
        var MQTT_Message = {'TagName':'Tag','Topic':topic,'Message':message.toString()}
        var object = {'Tag':MQTT_Message}
        dbo.collection('MQTT_History').insertOne(object,function(err,res){
            console.log('Object Inserted: '+ MQTT_Message)
        })
            
    })
})

app.get('/history', function(req,res){
    MongoClient.connect(MONGO_ADDR,{ useNewUrlParser: true },function(err,db){
        var dbo = db.db('DB')
        dbo.collection('MQTT_History').find({}).toArray(function(err, result) {
            if (err) throw err;
            res.json(result);
        })
    })
})

var PORT = process.env.PORT || 1337;
http.createServer(app).listen(PORT)