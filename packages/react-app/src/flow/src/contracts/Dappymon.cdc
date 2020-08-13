 import NonFungibleToken from 0x01

  pub contract Dappymon: NonFungibleToken {

      pub var totalSupply: UInt64

      // emit Converted(id: Dappymon.totalSupply, ethid: ethID)
      pub event Converted(id: UInt64, ethid: String, address: Address?)

      pub event ContractInitialized()
      pub event Withdraw(id: UInt64, from: Address?)
      pub event Deposit(id: UInt64, to: Address?)


      pub resource NFT: NonFungibleToken.INFT {
          pub let id: UInt64
          pub var metadata: {String: String}

          init(initID: UInt64, ethTokenID: String) {
              self.id = initID

              self.metadata = {};
              self.metadata["name"] = "Creature";
              self.metadata["symbol"] = "OSC";
              self.metadata["baseTokenURI"] = "https://creatures-api.opensea.io/api/creature/";
              self.metadata["ethTokenID"] = ethTokenID;
          }
      }

      pub resource interface CollectionPublic {
          pub fun borrowDappymon(id: UInt64): &Dappymon.NFT
      }

      pub resource Collection: Dappymon.CollectionPublic ,NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
          // dictionary of NFT conforming tokens
          // NFT is a resource type with an ID field
          pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

          init () {
              self.ownedNFTs <- {}
          }

          // withdraw removes an NFT from the collection and moves it to the caller
          pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
              let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

              emit Withdraw(id: token.id, from: self.owner?.address)

              return <-token
          }

          // deposit takes a NFT and adds it to the collections dictionary
          // and adds the ID to the id arrayowner?.address
          pub fun deposit(token: @NonFungibleToken.NFT) {
              let token <- token as! @Dappymon.NFT

              let id: UInt64 = token.id

              // add the new token to the dictionary which removes the old one
              let oldToken <- self.ownedNFTs[id] <- token

              emit Deposit(id: id, to: self.owner?.address)

              destroy oldToken
          }

          // getIDs returns an array of the IDs that are in the collection
          pub fun getIDs(): [UInt64] {
              return self.ownedNFTs.keys
          }

          // borrowNFT gets a reference to an NFT in the collection
          // so that the caller can read its metadata and call its methods
          pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
              return &self.ownedNFTs[id] as &NonFungibleToken.NFT
          }


          pub fun borrowDappymon(id: UInt64): &Dappymon.NFT {
              pre {
                  self.ownedNFTs[id] != nil: "NFT does not exist in the collection!"
              }
              let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
              return ref as! &Dappymon.NFT
              //return &self.ownedNFTs[id] as! &Dappymon.NFT
          }


          destroy() {
              destroy self.ownedNFTs
          }
      }

      // public function that anyone can call to create a new empty collection
      pub fun createEmptyCollection(): @NonFungibleToken.Collection {
          return <- create Collection()
      }

      // Resource that an admin or something similar would own to be
      // able to mint new NFTs
      //
    pub resource NFTMinter {

      // mintNFT mints a new NFT with a new ID
      // and deposit it in the recipients collection using their collection reference
      pub fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, ethID: String) {


        // create a new NFT
        var newNFT <- create NFT(initID: Dappymon.totalSupply, ethTokenID: ethID)

        // deposit it in the recipient's account using their reference
        recipient.deposit(token: <-newNFT)

        emit Converted(id: Dappymon.totalSupply, ethid: ethID, address: recipient.owner?.address)

        Dappymon.totalSupply = Dappymon.totalSupply + UInt64(1)
      }
    }

    init() {
          // Initialize the total supply
          self.totalSupply = 0

          // Create a Collection resource and save it to storage
          let collection <- create Collection()
          self.account.save(<-collection, to: /storage/NFTCollection)

          // create a public capability for the collection
          self.account.link<&{NonFungibleToken.CollectionPublic}>(
              /public/NFTCollection,
              target: /storage/NFTCollection
          )

          // Create a Minter resource and save it to storage
          let minter <- create NFTMinter()
          self.account.save(<-minter, to: /storage/NFTMinter)

          emit ContractInitialized()
          log("Dappymon deployed")
    }
  }
