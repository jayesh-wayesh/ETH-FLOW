import NonFungibleToken from 0x01
import Dappymon from 0x02

transaction{
      
    let minterRef : &Dappymon.NFTMinter
    let receiverRef : &{Dappymon.CollectionPublic,NonFungibleToken.CollectionPublic}
      
    prepare(acct: AuthAccount) {
        self.minterRef = acct.borrow<&Dappymon.NFTMinter>(from: /storage/NFTMinter)!
        self.receiverRef = getAccount(0x03).getCapability(/public/NFTReceiver)!
                                                               .borrow<&{Dappymon.CollectionPublic,NonFungibleToken.CollectionPublic}>()!
    }
      
    execute{
        self.minterRef.mintNFT(recipient: self.receiverRef, ethID: TOKEN_ID)
        log("NFT minted and transferred to User")
        log(self.receiverRef.getIDs())
    }
}