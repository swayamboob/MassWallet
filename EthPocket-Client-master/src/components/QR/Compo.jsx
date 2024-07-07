import React, { Component, useContext } from 'react'
import QrReader from 'react-weblineindia-qrcode-scanner'
import { TransactionContext } from '../../context/TransactionContex'
import linkAudion from "../../assets/tune.mp3"
const Compo = ()=> {
  const {QrResult,setQrResult,isScanning,setIsScanning}= useContext(TransactionContext);
  const notification = new Audio(linkAudion);
  // constructor(props){
  //   super(props)
  //   this.state = {
  //     delay: 100,
  //     result: null,
  //   }

  //   this.handleScan = this.handleScan.bind(this)
  // }
  
  const handleScan=(data)=>{
    if(data && data!=QrResult){
      // ethereum:0x792a38692f37054072e23b86f9376ff16c28F1DF@5
      notification.play();
      setQrResult(data.slice(9,51));
      console.log(data);
      setIsScanning(false);
    }
  }
  const handleError=(err)=>{
    console.error(err)
  }
    return(
      <div >
        <QrReader className='border-2 p-0 m-1 w-full'
          delay={100}
          onError={ handleError}
          onScan={handleScan}
          />
        <p1 className="text-white semibold">Scanning....</p1>
        <p2 className="text-white">
          {
            QrResult && (
              <p>address:{QrResult}</p>
            )
          }
        </p2>
      </div>
    )
}
export default Compo;