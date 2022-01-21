const SHA256 = require ('crypto-js/sha256')

const DIFFICULTY = 3;

class Block {
    constructor( timestamp , lastHash , hash , data , nonce) {
        this.timestamp = timestamp ;
        this.lastHash = lastHash ;
        this.hash = hash ;
        this.data = data ;
        this.nonce = nonce ;
    }

    toString() {
        return `Block -
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Data      : ${this.data}
        Nonce     : ${this.nonce}`;

    }

    static genesis () {
        return new this ('Genesis time' , '----' , 's18hau89sau9' , [] ,0) ;
    }

    static mineBlock ( lastBlock , data ) {

        const lastHash = lastBlock.hash ;
        let nonce = 0 , timestamp , hash ;

        do {
            timestamp = Date.now() ;
            nonce++;
            hash = Block.hash (timestamp , lastHash , data , nonce) ;
        }while ( hash.substring(0,DIFFICULTY) !== '0'.repeat(DIFFICULTY)) ;


        return new this ( timestamp , lastHash , hash , data , nonce ) ;
    }

    static hash ( timestamp , lastHash , data , nonce ){

        return SHA256 (`${timestamp}${lastHash}${data}${nonce}`).toString();

    }

    static blockHash (block){
        const {timestamp ,  lastHash , data , nonce } =block ;
        return Block.hash(timestamp , lastHash , data , nonce ) ;
    }

}

module.exports = Block ;