const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');
//const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
  let transaction, wallet, recipient, amount , bc;

  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = 'r3c1p13nt';
    bc = new Blockchain();
    transaction = Transaction.newTransaction(wallet, recipient, amount ,bc );
  });

  it('outputs the `amount` subtracted from the wallet balance', () => {
    expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount);
  });

  it('outputs the `amount` added to the recipient', () => {
    expect(transaction.outputs.find(output => output.address === recipient).amount)
      .toEqual(amount);
  });

  describe('transacting with an amount that exceeds the balance', () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount , bc);
    });

    it('does not create the transaction', () => {
      expect(transaction).toEqual(undefined);
    });
  });

  it('inputs the balance of the wallet', () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it('validates a valid transaction', () => {
    expect(Transaction.verifyTransactionByValidator(transaction)).toBe(false);
    //needs to update this testacase as broadcasting is done
  });

  it('invalidates a corrupt transaction', () => {
    transaction.outputs[0].amount = 50000;
    expect(Transaction.verifyTransactionByValidator(transaction)).toBe(false);
  });

  describe('and updating a transaction', () => {
    let nextAmount, nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = 'n3xt-4ddr355';
      transaction = Transaction.update(wallet, nextRecipient, nextAmount ,transaction);
    });

    it(`subtracts the next amount from the sender's output`, () => {
      expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount - nextAmount);
    });

    it('outputs an amount for the next recipient', () => {
      expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
        .toEqual(nextAmount);
    });
  });


});