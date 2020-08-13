// check if receiver is setup or not
import Dappymon from 0x02
import NonFungibleToken from 0x01

pub fun main(): String {

    let nftOwner = getAccount(0x03)

    // Find the public Receiver capability for their Collection
    let capability = nftOwner.getCapability(/public/NFTReceiver)!

    // borrow a reference from the capability
    let receiverRef = capability.borrow<&{Dappymon.CollectionPublic, NonFungibleToken.CollectionPublic}>() ?? nil

    // check if receiver is set up or not
    if (receiverRef != nil){
        log("true")
        return "true"
    }else{
        log("false")
        return "false"
    }
}
