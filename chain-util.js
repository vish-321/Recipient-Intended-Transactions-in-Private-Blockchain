const EC = require('elliptic').ec;
const ec = new EC ('secp256k1');
const uuidV1 = require('uuid').v1;
const SHA256 = require ('crypto-js/sha256')

const INITIAL_BALANCE = 500 ;

class ChainUtil {
    static genKeyPair(){
        return ec.genKeyPair();
    }

    static id(){
        return uuidV1();
    }

    static hash (data){
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature (publicKey , signature ,dataHash ){
        return ec.keyFromPublic(publicKey ,'hex').verify(dataHash,signature);
    }

    static calculateBalanceByPublicKey(blockchain , publicKey ){
        let balance = INITIAL_BALANCE;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));

        const walletInputTs = transactions
            .filter(transaction => transaction.input.address === publicKey);

        let startTime = 0;

        if (walletInputTs.length > 0) {
            const recentInputT = walletInputTs.reduce(
            (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            );

            balance = recentInputT.outputs.find(output => output.address === publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
            transaction.outputs.find(output => {
                if (output.address === publicKey) {
                balance += output.amount;
                }
            });
            }
        });

        return balance;
    }
}

module.exports = ChainUtil ;