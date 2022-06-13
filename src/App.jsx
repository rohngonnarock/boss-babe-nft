import { ethers } from "ethers";

function App() {
  var selectedValue = "";

  const setUser = async (selectedValue) => {
    //   let buttonValue = event.target.innerText;
    // document.querySelector('#mint-value').innerText = buttonValue;

    let User = {
      // changable // DONT FORGET ABI
      contractAddress: "0x220c9dA65484Abf9DA92f46e432193C9E5AFEb4B", // main  
      costPerToken: "0.07",
      totalMintSupply: "3000",
      // set immediately
      // amountToMint: Number(document.getElementByClass('amountToMint').value),
      amountToMint: selectedValue,
      accounts: await window.ethereum.request({
        method: "eth_requestAccounts",
      }),
      accountsPayload: null,
      provider: new ethers.providers.Web3Provider(window.ethereum),
      signer: null,
      // get through functions
      signedMessage: null,
      isMintFinal: null,
      jsonOfAbi: null,
      contractObject: null,
      totalMintedNow: null,
    };

    User.accountsPayload = User.accounts[0];
    User.signer = await User.provider.getSigner();
    // console.log('->',User.accountsPayload);
    return User;
  };

  const getSignature = async (User) => {
    let res = await fetch("/recieve", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountList: User.accounts,
        signer: User.accountsPayload,
        amountToMint: User.amountToMint,
      }),
    });

    let resJson = await res.json();
    return await [
      resJson.nonce,
      resJson.walletToCheck,
      resJson.signedMessage,
      resJson.isMintFinal,
    ];
  };

  const importJsonOfAbi = async (User) => {
    let jsonOfAbi = await fetch("./abi.json").then((response) =>
      response.json()
    );
    return await jsonOfAbi;
  };

  const getContractObject = async (User) => {
    const contractObject = new ethers.Contract(
      User.contractAddress,
      User.jsonOfAbi,
      User.signer
    );
    return await contractObject;
  };

  const getTotalMintedNow = async (User) => {
    try {
      const totalMintedNow = (
        await User.contractObject.connect(User.signer).totalSupply()
      ).toNumber();

      // document.getElementById(
      //   'supplyDisplay'
      // ).innerHTML = `<i><b>${totalMintedNow}/${User.totalMintSupply} minted</b><i>`;
      return await totalMintedNow;
    } catch (err) {
      // document.getElementById(
      //   'supplyDisplay'
      // ).innerHTML = `<i><b>Error getting total supply.</b><i>`;
      return await "0";
    }
  };

  const mintNFT = async (User) => {
    if (Number(User.totalMintedNow) < Number(User.totalMintSupply)) {
      await User.contractObject
        .connect(User.signer)
        .mintTheNFT(
          User.amountToMint.toString(),
          User.nonce,
          User.walletToCheck,
          User.signedMessage,
          {
            value: ethers.utils
              .parseEther(User.costPerToken)
              .mul(User.amountToMint),
          }
        )
        //                .mintTheNFT(User.amountToMint.toString(), User.nonce, User.signedMessage, { value: ethers.utils.parseEther(User.costPerToken).mul(User.amountToMint)})
        .then(() => alert("Congrats! Your NFT will arrive shortly!"))
        .catch((error) => {
          console.error(error);
          alert(error);
        });
    } else {
      alert("All NFTs minted!");
    }
  };

  const mothership = async () => {
    try {
      //this is the selected value here ***********
      selectedValue = Number(document.getElementById("amountToMint").value);
      console.log(selectedValue);
      if (
        selectedValue === 0 ||
        selectedValue === null ||
        selectedValue === undefined
      ) {
        console.log("change1");
        selectedValue = 1;
      }
      if (selectedValue > 5) {
        console.log("change2");
        selectedValue = 5;
      }

      console.log("Select Mint value :" + selectedValue);

      //******************************************************
      console.log("running");
      let User = await setUser(selectedValue);
      // // await getSignature(User);
      [User.nonce, User.walletToCheck, User.signedMessage, User.isMintFinal] =
        await getSignature(User);
      console.log(User.amountToMint);
      // // User.accounts = await getAccounts();
      User.jsonOfAbi = await importJsonOfAbi(User);
      User.contractObject = await getContractObject(User);
      User.totalMintedNow = await getTotalMintedNow(User);
      if (User.isMintFinal) {
        await mintNFT(User);
      } else {
        alert("Not allowed to mint!");
      }
    } catch (err) {
      console.log(err);
    }
    // console.log(User);
  };

  const getSupply = async (User) => {
    try {
      const json = await fetch("/supply")
        .then((response) => response.json())
        .then((data) => data.totalSupply);
      console.log(json);
      // const json = 'hi'

      document.getElementById(
        "supplyDisplay"
      ).innerText = `${json}/${"3000"} minted`;
    } catch (err) {
      console.log("supply error");
      document.getElementById(
        "supplyDisplay"
      ).innerText = `Error getting total supply.`;
    }

    // document.getElementById(
    //     'supplyDisplay'
    //   ).innerHTML = `<i><b>${totalMintedNow}/${User.totalMintSupply} minted</b><i>`;
    //     return await totalMintedNow;
    // } catch (err) {
    //   document.getElementById(
    //     'supplyDisplay'
    //   ).innerHTML = `<i><b>Error getting total supply.</b><i>`;
    //     return await '0';
    // }
    // return await json
    // };
  };

  const motherSupply = async () => {
    await getSupply();
  };

  // let totalSupply = getSupply()
  // motherSupply()


  return (
    <>
      <header className="top-nav">
        <div className="container">
          <a href="https://www.bossbabesnft.com/" className="logo">
            BOSS BABES NFT
          </a>
        </div>
      </header>

      <section className="hero-home">
        <div className="container">
          <div className="row gy-4 justify-content-between align-items-center">
            <div className="col-lg-4">
              <div className="hero-text">
                <div className="priamry-title">
                  <h1>Mint Here</h1>
                </div>
                <div className="act-text">
                  <p>
                    3000 NFT's at 0.06 Eth presale &amp; 0.07 Eth main sale. Max
                    5 per transaction.
                  </p>
                  <div className="form-con">
                    <input
                      type="text"
                      id="amountToMint"
                      className="form-control amountToMint"
                      placeholder="Amount to Mint...."
                    />
                    <button className="btn-mint purchase" onClick={mothership}>Mint</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-img">
                <img
                  src="https://bossbabesnft-mint.com/assets/img/hero-img.gif"
                  className="img-fluid"
                  alt="hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="social-list">
        <ul>
          <li>
            <a href="http://discord.gg/atPBVFtwV9" target="_blank">
              <img
                src="https://bossbabesnft-mint.com/assets/img/discord.png"
                alt="discord"
              />
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/bossbabesnft/" target="_blank">
              <img
                src="https://bossbabesnft-mint.com/assets/img/instagram.png"
                alt="instagram"
              />
            </a>
          </li>
          <li>
            <a href="https://twitter.com/BossBabesNFT" target="_blank">
              <img
                src="https://bossbabesnft-mint.com/assets/img/twitter.png"
                alt="twitter"
              />
            </a>
          </li>
        </ul>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="copyright">
            <span>EST. 2022 by Boss Club Collective LLC</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
