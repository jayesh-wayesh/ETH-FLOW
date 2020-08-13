      import Dappymon from 0x179b6b1cb6755e31
      import NonFungibleToken from 0x01cf0e2f2f715450
      
      pub fun main(): String {
          let ref = getAccount(0xf3fcd2c1a78f5eee)
                      .getCapability(/public/NFTReceiver)!
                      .borrow<&{Dappymon.CollectionPublic,NonFungibleToken.CollectionPublic} >()!
          
          let x: &Dappymon.NFT = ref.borrowDappymon(id: 1)
          log(ref.borrowNFT(id: 1))
          
          var res:String = x.metadata["baseTokenURI"]!
          return res
      }