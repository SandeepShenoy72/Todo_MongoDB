const express = require("express")
const mongoose = require("mongoose")
const _ = require("lodash")

const app =express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

const port = 3000

app.set("view engine","ejs")

var today = new Date();

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = {
    name:String
}

const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
    name:"Breakfast"
})

const item2 = new Item({
    name:"Lunch"
})

const item3 = new Item({
    name:"Dinner"
})

const defaultItems = [item1,item2,item3]

const listSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("list",listSchema)

// 
app.get("/",(req,res)=>{
   Item.find().then(rest =>{

    if(rest.length === 0){
        Item.insertMany(defaultItems)
        .then(function(){
            console.log("Successfully saved into our DB.");
        })
        .catch(function(err){
            console.log(err);
        });
        res.redirect("/")
    }else{
        res.render('list',{listTitle:"Today",newitems:rest})
    }
    });
    
})

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName)

    // console.log(customListName)

    List.findOne({name:customListName}).then(ans =>{
        if(!ans){
            const list = new List({
                name:customListName,
                items:defaultItems
            })
            list.save()
            res.redirect("/"+customListName)
        }else{
            // console.log("Don't Exists")
            res.render('list',{listTitle:ans.name,newitems:ans.items})
        }
   })
    

    // list.save();
})

app.post("/",(req,res)=>{
    var itemName = req.body.listItem
    var listName = req.body.listName

  
    const item1 = new Item({
        name:itemName
    })

    if(listName=="Today"){
        item1.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName}).then(foundList =>{
            foundList.items.push(item1)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    

 
})


app.post("/delete",(req,res)=>{
    const listName = req.body.lost
    const itemId = req.body.checkbox

    if(listName=="Today"){
        Item.deleteOne({_id:itemId}).then(res =>{
            console.log("Deleted Successfully")
        })
        res.redirect("/")
    }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}}).then(resu =>{
        res.redirect("/"+listName)
    })
    }
})



app.listen(port,(req,res)=>{
    console.log(`Server running on ${port}`)
})