const express = require("express");
const bodyParser=require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require ('./p2p-server') ;
const Wallet = require('../wallet');
const TransactionPool =  require('../wallet/transaction-pool');
const Validator =  require ('./validator') ;

const HTTP_PORT = process.env.HTTP_PORT || 3001 ;
const app = express() ;
const bc = new Blockchain();
const wallet = new Wallet() ;
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc , tp , wallet);
const validator = new Validator (bc , tp , wallet , p2pServer) ;

app.use(bodyParser.json());
app.get('/blocks',(req,res)=>{
    res.json(bc.chain);
});


app.get('/transactions' , (req ,res)=>{
    res.json(tp.transactions);
});

app.get ('/mine-transactions', (req,res)=>{
    //identifying validator node by port
    if (HTTP_PORT == 3003 ){
        const block = validator.mine();
        console.log(`New block added : ${block.toString()}`);
    }
    res.redirect('/blocks');
});

app.post('/transact' , (req ,res)=>{
    const {recipient , amount} = req.body ;
    const transaction = wallet.createTransaction(recipient , amount , tp , bc);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/public-key' , (req ,res)=>{
    res.json({publickey : wallet.publicKey});
});


app.listen(HTTP_PORT , ()=> console.log (`listening on port ${HTTP_PORT}`));
p2pServer.listen();


//command to start application
//HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
//HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
