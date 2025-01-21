import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { prepare, request, getResult } from 'klip-sdk';
import QRCode from 'qrcode.react';
import Modal from 'react-modal';

import daolabnft from '../assets/daolabnft.png';

import addresses from '../config/addresses.json';

import './Membership.css';

function Membership() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [isMembership, setIsMembership] = useState(false);
  const [memberMetadata, setMemberMetadata] = useState([]);

  const nftAddress = addresses.membershipNft;
  const mintAbi = '{"constant":false,"inputs":[],"name":"mint","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}';
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
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasPurchased",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
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
  const nftImagesLink = [];
  for (let i = 0; i <= 100; i++) {
    nftImagesLink.push(`https://raw.githubusercontent.com/modudao/images/main/members/nft${i}.png`);
  }

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
    const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);

    const checkMembershipStatus = async () => {
      try {
        const userAdderss = localStorage.getItem('klipAddress');
        if (userAdderss == '') {
          setIsMembership(false);
        } else {
          const membershipStatus = await nftContract.hasPurchased(userAdderss);
          if (membershipStatus) {
            setIsMembership(true);
            const metadata = await nftContract.getUsersNickname();
            setMemberMetadata(metadata);
          } else {
            setIsMembership(false);
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
      to: nftAddress,
      abi: mintAbi,
      value: '10' + '0'.repeat(18),
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

    const userAgent = navigator.userAgent;
    if (/Windows/i.test(userAgent) || /Macintosh/i.test(userAgent)) {
      const qrURL = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
      // window.open(qrURL, '_blank');
      setQrValue(qrURL);

      openModal();
    } else {
      request(request_key);
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
      {!isMembership ? (
        <div className='membership-body-wrapper'>
          <div className='membership-body-text'>맴버십을 구매하세요</div>
          <img className='modu-nft-image' style={{ width: 259, height: 259 }} src={daolabnft} />
          <div className='membership-body-text-sub'>2025 다오랩 4기 시작을 기념하기 위한 NFT 카드입니다. 이 NFT는 양도가 불가능한 SBT입니다.</div>
          <div className='membership-body-text-sub2'>*가격: 10 KAIA</div>
          <button className='membership-button' onClick={mintNFT}>
            <div className='faucet-button-text'>구매</div>
          </button>
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
          <div className='membership-body-text'>맴버가 되신걸 환영합니다</div>
          <div className='membership-body-text-sub-success'>총 <span style={{ fontWeight: 'bold' }}>{memberMetadata.length}</span> 명의 맴버가 함께하고 있습니다! 거버넌스 페이지에서 투표를 진행해보세요!</div>
          <div className='membership-member-body'>
            {/*  */}
            {memberMetadata.map((member, index) => (
              <div className='membership-member-wrapper' key={index}>
                <img className='modu-nft-image' style={{ width: 111, height: 111 }} src={nftImagesLink[index]} />
                <div className='membership-nft-text'>{member} 님</div>
              </div>
            ))}
            {/*  */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Membership;
