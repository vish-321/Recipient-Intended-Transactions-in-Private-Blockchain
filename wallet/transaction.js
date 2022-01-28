const { send } = require('express/lib/response');
const ChainUtil = require ('../chain-util');

class Transaction {
    constructor(){
        this.id = ChainUtil.id();
        this.input = null ;
        this.outputs = [] ;
        this.recipient_signatures = {} ;
    }

    static update (senderWallet , recipient , amount , transaction){
        const senderOutput = transaction.outputs.find (output => output.address == senderWallet.publicKey);

        if ( amount > senderOutput.balance ){
            console.log(`Amount : ${amount} excceds senders balance`);
            return ;
        }

        senderOutput.amount = senderOutput.amount - amount ;
        transaction.outputs.push({amount , address :recipient});
        transaction.recipient_signatures ={} ;
        Transaction.signTransaction(transaction , senderWallet);

        return transaction ;
    }

    static newTransaction(senderWallet , recipient , amount ,bc ){
        const transaction = new this ();
        senderWallet.balance = senderWallet.calculateBalance(bc);

        if (amount > senderWallet.balance){
            console.log(`Amount : ${amount} excceds senders balance`);
            return ;
        }

        transaction.outputs.push(...[
            {amount : senderWallet.balance - amount , address : senderWallet.publicKey},
            {amount , address: recipient}
        ]);

        Transaction.signTransaction( transaction , senderWallet);

        return transaction ;
    }

    static signTransaction (transaction , senderWallet ){
        transaction.input = {
            timestamp : Date.now(),
            amount : senderWallet.balance ,
            address : senderWallet.publicKey ,
            signature : senderWallet.sign(ChainUtil.hash(transaction.outputs))
        };
        const address = senderWallet.publicKey ;
        transaction.recipient_signatures[address] = senderWallet.sign(ChainUtil.hash(transaction.outputs));
    }

    static verifyTransactionByValidator (transaction){

        for (const recipient of transaction.outputs){

            const address = recipient.address ;
            //console.log(address)
            //console.log (transaction.recipient_signatures.address) ;
            if (!transaction.recipient_signatures[address])
                return false ;

            const isValidRecipient = ChainUtil.verifySignature(
                address ,
                transaction.recipient_signatures[address] ,
                ChainUtil.hash(transaction.outputs)
            );

            if (!isValidRecipient) {
                return false ;
            }
        }

        return ChainUtil.verifySignature(
            transaction.input.address ,
            transaction.input.signature ,
            ChainUtil.hash(transaction.outputs)
        );
    }

    static verifyTransactionByReceiver (transaction , recipientWallet , bc){
        //This method checks if wallet is receiver of transaction and checks if transaction is valid
        //if both conditions are true it adds wallet signature in transaction and return true
        //else return false

        const senderBalance = ChainUtil.calculateBalanceByPublicKey(bc , transaction.input.address);

        if (senderBalance != transaction.input.amount){
            console.log(`Invalid transaction from ${transaction.input.address}`);
            return false ;
        }

        const outputTotal = transaction.outputs.reduce ( (total , output ) =>{
            return total + output.amount ;
        } ,0);

        if (transaction.input.amount !== outputTotal){
            console.log(`Invalid transaction from ${transaction.input.address}`);
            return false ;
        }

        const isSenderSignatureValid = ChainUtil.verifySignature(
            transaction.input.address ,
            transaction.input.signature ,
            ChainUtil.hash(transaction.outputs)
        );

        if ( !isSenderSignatureValid){
            console.log(`Invalid transaction from ${transaction.input.address}`);
            return false ;
        }

        for (const recipient of transaction.outputs){
            if (recipient.address == recipientWallet.publicKey && !transaction.recipient_signatures[recipientWallet.publicKey]){
                transaction.recipient_signatures[recipientWallet.publicKey]= recipientWallet.sign(ChainUtil.hash(transaction.outputs));
                return true ;
            }
        }

        return false ;

    }
}

module.exports = Transaction ;