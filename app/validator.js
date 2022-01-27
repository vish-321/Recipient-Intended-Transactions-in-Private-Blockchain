class Validator {
    constructor(blockchain , transactionPool , wallet , p2pServer ){
        this.blockchain = blockchain ;
        this.transactionPool = transactionPool ;
        this.wallet = wallet ;
        this.p2pServer = p2pServer ;
    }

    mine (){
        const validTransactions = this.transactionPool.validTransactions();
        // include reward for miner
        // create a block consisting of valid transactions
        // synchronize chains in peer to peer
        // clear transaction pool
        // broadcast to users

        const block = this.blockchain.addBlock (validTransactions);
        this.p2pServer.syncChains();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearTransaction ();

        return block ;

    }
}

module.exports = Validator ;