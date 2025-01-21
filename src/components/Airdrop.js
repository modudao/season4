import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { prepare, request, getResult } from 'klip-sdk';
import QRCode from 'qrcode.react';
import Modal from 'react-modal';

import present from '../assets/present.png';
import soldOut from '../assets/end.png';

import addresses from '../config/addresses.json';

import './Airdrop.css';

function Membership() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [isMembership, setIsMembership] = useState(false);
  const [isPurchase, setIsPurchase] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [memberMetadata, setMemberMetadata] = useState([]);

  const rwaAddress = addresses.rwaNft;
  const nftAddress = addresses.membershipNft;
  const mintAbi = '{"inputs":[],"name":"mint","outputs":[],"stateMutability": "nonpayable","type":"function"}';
  const nftAbi = [{
    "inputs": [],
    "name": "tokenCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUsersNickname",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },];

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
    const rwaContract = new ethers.Contract(rwaAddress, nftAbi, provider);
    const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);

    const checkMembershipStatus = async () => {
      try {
        const userAdderss = localStorage.getItem('klipAddress');
        if (userAdderss == '') {
          setIsPurchase(false);
        } else {
          const purchaseStatus = await nftContract.balanceOf(userAdderss);
          setIsMembership(purchaseStatus);

          const membershipStatus = await rwaContract.balanceOf(userAdderss);
          if (membershipStatus) {
            console.log("membershipStatus", membershipStatus)
            setIsPurchase(true);
            const totalCount = await rwaContract.tokenCounter();
            setTotalSupply(totalCount);
            const metadata = await rwaContract.getUsersNickname();
            setMemberMetadata(metadata);
          } else {
            setIsPurchase(false);
          }
        }
      } catch (error) {
        // console.error('Error checking membership status:', error);
      }
    };

    // 10초마다 갱신
    checkMembershipStatus();
    const intervalId = setInterval(checkMembershipStatus, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const mintNFT = async () => {
    const bappName = 'MODULAB DAPP';

    // Step 1: Prepare the contract action
    const transaction = {
      bappName,
      to: rwaAddress,
      abi: mintAbi,
      value: '0',
      params: '[]',
      from: localStorage.getItem('klipAddress'),
    };

    // Step 2: Request the contract action through Klip
    const { request_key } = await prepare.executeContract(transaction);
    // const res = await axios.post(A2P_API_PREPARE_URL, {
    //   bapp: { name: bappName, },
    //   transaction,
    //   type: "execute_contract",
    // })
    // const { request_key } = res.data;

    if (!isPurchase) {
      const userAgent = navigator.userAgent;
      if (/Windows/i.test(userAgent) || /Macintosh/i.test(userAgent)) {
        const qrURL = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        // window.open(qrURL, '_blank');
        setQrValue(qrURL);

        openModal();
      } else {
        request(request_key);
      }
    }

    // Step 3: Poll for the result
    // const interval = setInterval(() => {
    //   getResult(request_key, (result) => {
    //     if (result.err) {
    //       console.error(result.err);
    //       clearInterval(interval);
    //       return;
    //     }
    //     if (result.result) {
    //       clearInterval(interval);
    //     }
    //   });
    // }, 1000);
  };

  return (
    <div className='membership-body'>
      {totalSupply < 3 ? (
        // {totalSupply < 1 ? (
        <div className='membership-body-wrapper'>
          <div className='membership-body-text'>머플러를 받아가세요!</div>
          <img className='modu-nft-image' style={{ width: 259, height: 259 }} src={present} />
          <div className='membership-body-text-sub'>따듯한 겨울을 위한 특별 선물! 맴버십 회원 <span style={{ fontWeight: 'bold' }}>선착순 3명</span>에게 패딩 목도리를 드립니다. 받기 버튼을 눌러 RWA NFT를 소유하고 실물 목도리를 받아보세요. 서두르세요, 수량이 한정되어 있습니다!</div>
          {isMembership ? (
            <div className='membership-body-text-sub2-wrapper'>
              <div className='membership-body-text-sub2'>*남은 인원: {3 - totalSupply.toString()}명</div>
              <button className={isPurchase ? 'membership-button-inactive' : 'membership-button'} onClick={mintNFT}>
                <div className='faucet-button-text'>{isPurchase ? '받기 완료' : '받기'}</div>
              </button>
            </div>
          ) : (
            <div className='membership-body-text-sub2-wrapper'>
              <div className='membership-body-text-sub3'>*먼저 맴버십을 구매해주세요</div>
            </div>)}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="modal-content"
            overlayClassName="modal-overlay"
            contentLabel="QR Code Modal"
          >
            <div className='membership-body-text'>QR 코드를 스캔하세요</div>
            <QRCode value={qrValue} size={256} />
          </Modal>
        </div>
      ) : (
        <div className='membership-body-wrapper'>
          <div className='membership-body-text'>선착순 마감되었습니다</div>
          <img className='modu-nft-image' style={{ width: 259, height: 259 }} src={soldOut} />
          <div className='membership-body-text-sub'>축하합니다! <span style={{ fontWeight: 'bold' }}>{memberMetadata[0]}님, {memberMetadata[1]}님, {memberMetadata[2]}님</span> 선착순 이벤트에 당첨되셨습니다. 패딩 머플러를 곧 받아보실 수 있습니다. 참여해 주신 모든 분들께 감사드립니다!</div>
          {/* <div className='membership-body-text-sub'>축하합니다! <span style={{ fontWeight: 'bold' }}>{memberMetadata[0]}님, {memberMetadata[0]}님, {memberMetadata[0]}님</span> 선착순 이벤트에 당첨되셨습니다. 패딩 머플러를 곧 받아보실 수 있습니다. 참여해 주신 모든 분들께 감사드립니다!</div> */}
        </div>
      )}
    </div>
  );
}

export default Membership;
