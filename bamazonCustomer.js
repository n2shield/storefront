//require mysql and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');
//create connection to db
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
})

function start(){
//prints the items for sale and their details
connection.query('SELECT * FROM products', function(err, res){
  if(err) throw err;

  console.log("(O'.')O Thank you for shopping with BAMAZON! O('.'O)");
  console.log('----------------------------------------------------------------------------------------------------');

  for(var i = 0; i<res.length;i++){
    console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].product_name + " | " + "Department: " + res[i].department_name + " | " + "Price: " + res[i].price + " | " + "QTY: " + res[i].stock_quantity);
    console.log('--------------------------------------------------------------------------------------------------');
  }

  console.log(' ');
  inquirer.prompt([
    {
      type: "input",
      name: "id",
      message: "What is the ID of the product you would like to purchase?",
      validate: function(value){
        if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
          return true;
        } else{
          return false;
        }
      }
    },
    {
      type: "input",
      name: "qty",
      message: "How much would you like to purchase?",
      validate: function(value){
        if(isNaN(value)){
          return false;
        } else{
          return true;
        }
      }
    }
    ]).then(function(ans){
      var whatToBuy = (ans.id)-1;
      var howMuchToBuy = parseInt(ans.qty);
      var grandTotal = parseFloat(((res[whatToBuy].price)*howMuchToBuy).toFixed(2));

      //check if quantity is sufficient
      if(res[whatToBuy].stock_quantity >= howMuchToBuy){
        //after purchase, updates quantity in Products
        connection.query("UPDATE products SET ? WHERE ?", [
        {stock_quantity: (res[whatToBuy].stock_quantity - howMuchToBuy)},
        {ItemID: ans.id}
        ], function(err, result){
            if(err) throw err;
            console.log("Success! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 3-5 business days.");
        });

        connection.query("SELECT * FROM department_name", function(err, deptRes){
          if(err) throw err;
          var index;
          for(var i = 0; i < deptRes.length; i++){
            if(deptRes[i].department_name === res[whatToBuy].department_name){
              index = i;
            }
          }
          
          //updates totalSales in departments table
          connection.query("UPDATE department_name SET ? WHERE ?", [
          {TotalSales: deptRes[index].TotalSales + grandTotal},
          {department_name: res[whatToBuy].department_name}
          ], function(err, deptRes){
              if(err) throw err;
              //console.log("Updated Dept Sales.");
          });
        });

      } else{
        console.log("Sorry, there's not enough in stock!");
      }

      reprompt();
    })
})
}

//asks if they would like to purchase another item
function reprompt(){
  inquirer.prompt([{
    type: "confirm",
    name: "reply",
    message: "Would you like to purchase another item?"
    
  }]).then(function(ans){
    if(ans.reply === "y"){
      start();
    } else if (ans.reply === 'n'){
      console.log("See you soon!");
    } else if (err) {
      throw err;
    }
  });
}

start();