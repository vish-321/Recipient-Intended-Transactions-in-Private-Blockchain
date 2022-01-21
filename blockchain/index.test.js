const Blockchain = require ('./index');
const Block = require ('./block');

describe('Blockchain', () => {
    let bc , bc2 ;

    beforeEach(() => {
        bc = new Blockchain ();
        bc2 = new Blockchain();
    });

    it ('starts with genesis block' , () => {
        expect (bc.chain[0]).toEqual (Block.genesis()) ;
    }) ;

    it ('adds new block' , () => {
        const data = 'foo' ;
        bc.addBlock (data) ;

        expect( bc.chain[bc.chain.length -1 ].data ).toEqual (data) ;
    }) ;

    it ('validates a new blockchain', () => {
        bc2.addBlock('foo');
        expect(bc2.isValidChain(bc2.chain)).toBe(true);
    }) ;

    it ('invalidates a chain with corrupt genesis block',() =>{
        bc2.chain[0].data = 'corrupt data' ;
        expect(bc2.isValidChain(bc2.chain)).toBe(false);
    });

    it ('replaces the chain with valid chain', ()=>{
        bc2.addBlock ('too');
        bc.replaceChain (bc2.chain);
        expect( bc.chain ).toEqual (bc2.chain) ;
    });

    it ('does not replace chain with less or equal length', ()=>{
        bc.addBlock ('too');
        bc.replaceChain (bc2.chain);
        expect( bc.chain ).not.toEqual (bc2.chain) ;
    });


});