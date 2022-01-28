const Websocket = require ('ws') ;
const Transaction = require('../wallet/transaction');
const P2P_PORT = process.env.P2P_PORT || 5001 ;

const peers = process.env.PEERS ? process.env.PEERS.split(',') :[];


const MESSAGE_TYPES = {
    chain :'CHAIN',
    transaction : 'TRANSACTION',
    clear_transaction : 'CLEAR_TRANSACTIONS'
};

class P2pServer {
    constructor (blockchain , transactionPool , wallet ){
        this.blockchain=blockchain ;
        this.transactionPool = transactionPool ;
        this.wallet = wallet ;
        this.sockets =[];
    }

    listen(){
        const server = new Websocket.Server({port: P2P_PORT}) ;
        server.on('connection',socket => this.connectSocket(socket));

        this.connectToPeers();
        console.log (`listening to peer to peer connections on port ${P2P_PORT}`);
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log('socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);

        for (const transaction of this.transactionPool.transactions){
            this.sendTransaction(transaction ,socket);
        }
    }

    connectToPeers (){
        peers.forEach( peer => {
            // ws://localhost:5001
            const socket = new Websocket (peer) ;
            socket.on('open' , () => this.connectSocket(socket));
        });
    }

    messageHandler (socket){
        socket.on ('message', message =>{
            const data = JSON.parse(message);
            switch(data.type){
                case MESSAGE_TYPES.chain :
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction :
                    this.transactionPool.updateOrAddTransaction (data.transaction);
                    //assume we differentiate validator based on ip and port
                    // here we are on local host so we will just use port
                    if (P2P_PORT != 5003 && Transaction.verifyTransactionByReceiver(data.transaction,this.wallet , this.blockchain) ){
                        this.broadcastTransaction(data.transaction);
                    }
                    break;
                case MESSAGE_TYPES.clear_transaction :
                    this.transactionPool.clear();
                    break;
            }
        });
    }

    sendChain (socket){
        socket.send(JSON.stringify({
            type : MESSAGE_TYPES.chain,
            chain : this.blockchain.chain
        }));
    }

    sendTransaction (socket , transaction){
        socket.send(JSON.stringify({
            type : MESSAGE_TYPES.transaction ,
            transaction
        }));
    }

    syncChains (){
        this.sockets.forEach (socket =>{
            this.sendChain(socket);
        });
    }

    broadcastTransaction (transaction){
        this.sockets.forEach (socket =>{
            this.sendTransaction(socket , transaction);
        });
    }

    broadcastClearTransaction (){
        this.sockets.forEach (socket => socket.send ( JSON.stringify({
            type :MESSAGE_TYPES.clear_transaction
        })));
    }
}

module.exports =P2pServer ;