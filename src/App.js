import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

/*
* window.ethereumにアクセスできることを確認します。
*/
const App = () => {
   /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します */
  const [currentAccount, setCurrentAccount] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xbdd214a9f515b78dd1260d87f862a29ea2a39651";
  const contractABI = abi.abi;
  console.log("currentAccount: ", currentAccount);


  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        const waves = await wavePortalContract.getAllWaves();
        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          }
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object does not exsit");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // /* window.ethereumにアクセスできることを確認します */
  // const checkIfWalletIsConnected = async () => {
  //   try {
  //     const { ethereum } = window;
  //     if (!ethereum) {
  //       console.log("Make sure you have MetaMask!");
  //       return;
  //     } else {
  //       console.log("We have the ethereum object", ethereum);
  //     }
  //     /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
  //     const accounts = await ethereum.request({ method: "eth_accounts" });
  //     if (accounts.length !== 0) {
  //       const account = accounts[0];
  //       console.log("Found an authorized account:", account);
  //       setCurrentAccount(account);
  //     } else {
  //       console.log("No authorized account found");
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // connectWalletメソッドを実装
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // wave count function
  const wave = async() => {
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("Signer", signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Get total wave count...", count.toNumber());
        let contractBalance = await provider.getBalance(wavePortalContract.address);
        console.log("Contract balance:", ethers.utils.formatEther(contractBalance));  
        const waveTxn = await wavePortalContract.wave(messageValue, {gasLimit: 300000,});
        console.log("Minting...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Minted -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Get total wave count...", count.toNumber());
        let contractBalance_post = await provider.getBalance(wavePortalContract.address);
        console.log("Contract balance after wave:", ethers.utils.formatEther(contractBalance_post));
        if (contractBalance > contractBalance_post){
          console.log("User won ETH!");
        } else{
          console.log("User didn't win ETH.");
        }
      }
      else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error){
      console.log(error);
    }
  };

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves((prevState) => [
      ...prevState, 
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };
/*
* WEBページがロードされたときに下記の関数を実行します。
*/
  useEffect(() => {
    let wavePortalContract;



    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress, 
        contractABI, 
        signer
      );
      getAllWaves();
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);



  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="hand-wave">👋</span> WELCOME!
        </div>

        <div className="bio">
        イーサリアムウォレットを接続して、メッセージを作成したら、<span role="img" aria-label="hand-wave">👋</span>を送ってください<span role="img" aria-label="shine">✨</span>
        </div>


        {/* waveボタンにwave関数を連動させる。*/}
        <button className="waveButton" onClick={wave}>
          Wave at Me  
        </button>       
        {/* ウォレットコネクトのボタンを実装 */}
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
        )}
        {currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Wallet Connected
        </button>
        )}
        {currentAccount && (
          <textarea
            name="messageArea"
            placeholder="メッセージはこちら"
            type="text"
            id="message"
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
          />
        )}
        {currentAccount && (
          allWaves
            .slice(0)
            .reverse()
            .map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#F8F8FF",
                    marginTop: "16px",
                    padding: "8px",
                  }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default App;
